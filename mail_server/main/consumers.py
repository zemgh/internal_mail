import json
from datetime import datetime

from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model

from main.models import Mail, DraftMail
from main.serializers import MailSerializer, DraftSerializer

User = get_user_model()


class MainConsumer(WebsocketConsumer):
    user = None
    mail = Mail
    mail_serializer = MailSerializer
    draft = DraftMail
    draft_serializer = DraftSerializer

    mails_per_page = 18
    received_pp = None
    sent_pp = None
    deleted_pp = None
    drafts_pp = None


    def connect(self):
        self.accept()
        self.user = self.scope['user'].__dict__['_wrapped']
        self.user.add_channel(self.channel_name)
        print(f'user <{self.user}> connected at', datetime.now().strftime('%H:%M:%S'))


    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        print(f'income from {self.user}:', data)

        request_type = data.get('type')
        del data['type']
        method = getattr(self, request_type)
        method(data)


    def disconnect(self, code):
        self.user.remove_channel()
        print(f'disconnecting by {self.user}: ', code)


    def send_mails(self, methods=None, **kwargs):
        data = {
            'type': 'get_mails'
        }

        if not methods:
            data.update(self.send_all_mails())
        else:
            for method in methods:
                data.update(method())

        for k, v in kwargs.items():
            data[k] = v

        self.send(json.dumps(data))
        print(f'send to {self.user}:', data)


    def send_all_mails(self):
        send_data = {}
        methods = [self.send_received, self.send_sent, self.send_deleted, self.send_drafts]
        for method in methods:
            send_data.update(method())
        return send_data


    def send_received(self):
        number_of_mails = self.received_pp + self.mails_per_page + 1
        received_mails = self.user.received_mails.filter(deleted=False)[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=received_mails)
        unread_data = self.user.received_mails.filter(deleted=False, read=False).count()
        send_data = {'received': mails_data, 'unread': unread_data}
        return send_data


    def send_sent(self):
        number_of_mails = self.sent_pp + self.mails_per_page + 1
        sent_mails = self.user.sent_mails.all()[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=sent_mails)
        send_data = {'sent': mails_data}
        return send_data


    def send_deleted(self):
        number_of_mails = self.drafts_pp + self.mails_per_page + 1
        deleted_mails = self.user.received_mails.filter(deleted=True)[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=deleted_mails)
        send_data = {'deleted': mails_data}
        return send_data


    def send_drafts(self):
        number_of_mails = self.drafts_pp + self.mails_per_page + 1
        drafts = self.user.drafts.all()[:number_of_mails]
        drafts_data = self.draft_serializer.get_data_for_json(queryset=drafts)
        send_data = {'drafts': drafts_data}
        return send_data


    def send_command(self, command):
        data = {
            'type': 'command',
            'command': command
        }
        self.send(json.dumps(data))
        print('sent command:', command)


    def send_error(self, error):
        data = {
            'type': 'error',
            'error': error}
        self.send(json.dumps(data))


    def init(self, data):
        self.mails_per_page = data['mails_per_page']
        self.received_pp = self.sent_pp = self.deleted_pp = self.drafts_pp = self.mails_per_page
        self.send_mails()


    def get_mails(self, data):
        methods = []
        for k, v in data.items():
            if v != 'default':
                setattr(self, k + '_pp', v)
            else:
                setattr(self, k + '_pp', self.mails_per_page)
            method = getattr(self, 'send_' + k)
            methods.append(method)

        self.send_mails(methods=methods)



    def create_mail(self, data):
        validate = self.validate_receivers(data['receivers'])
        if validate != 'correct':
            return self.send_error(validate)

        mail = self.mail.objects.create(
            sender=self.user,
            subject=data['subject'],
            message=data['message']
        )
        receivers = User.objects.filter(username__in=data['receivers'])
        mail.receivers.set(receivers)
        mail.save()

        self.send_command('close_create_form')


    def delete_mails(self, data):
        id_list = data['mails_list']
        self.mail.objects.filter(id__in=id_list).update(deleted=True)

        self.send_mails(methods=[self.send_received, self.send_deleted])


    def recovery_mails(self, data):
        id_list = data['mails_list']
        self.mail.objects.filter(id__in=id_list).update(deleted=False)

        self.send_mails(methods=[self.send_received, self.send_deleted])


    def read_mails(self, data):
        id_list = data['mails_list']
        self.mail.objects.filter(id__in=id_list).update(read=True)

        self.send_mails(methods=[self.send_received])


    def create_draft(self, data):
        self.draft.objects.create(
            sender=self.user,
            receivers=' '.join(data['receivers']),
            subject=data['subject'],
            message=data['message']
        )


    def save_draft(self, data):
        draft = self.draft.objects.get(id=data['id'])
        draft.receivers = ' '.join(data['receivers'])
        draft.subject = data['subject']
        draft.message = data['message']
        draft.save()

        self.send_mails(methods=[self.send_drafts])


    def convert_to_mail(self, data):
        validate = self.validate_receivers(data['receivers'])
        if validate != 'correct':
            return self.send_error(validate)

        mail = self.mail.objects.create(
            sender=self.user,
            subject=data['subject'],
            message=data['message']
        )
        receivers = User.objects.filter(username__in=data['receivers'])
        mail.receivers.set(receivers)
        mail.save()

        self.draft.objects.get(id=data['id']).delete()

        self.send_mails(methods=[self.send_received, self.send_drafts], command='close_create_form')


    def delete_drafts(self, data):
        id_list = data['drafts_list']
        self.draft.objects.filter(id__in=id_list).delete()

        self.send_mails(methods=[self.send_drafts])


    def signals_handler(self, message, **kwargs):
        methods = []
        for method in message['methods']:
            methods.append(getattr(self, method))
        self.send_mails(methods=methods, **kwargs)


    def validate_receivers(self, receivers):
        users = User.objects.filter(username__in=receivers)
        users_list = [user.username for user in users]
        validate_result = list(set(receivers) - set(users_list))
        if len(validate_result) == 0:
            return 'correct'
        elif len(validate_result) == 1:
            return f'Пользователя {validate_result[0]} не существует!'
        elif len(validate_result) > 1:
            return f'Пользователей {', '.join(validate_result)} не существует!'


    def create_test_mail(self, useless_data):
        user = User.objects.get(username='test_user')
        mail = self.mail.objects.create(
            sender=user,
            subject='test_mail',
            message='this is a test mail',
        )
        mail.receivers.add(self.user)
        mail.save()
