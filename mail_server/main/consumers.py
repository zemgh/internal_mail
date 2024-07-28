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
    mails_per_page = None
    received = None
    sent = None
    deleted = None
    drafts = None

    def connect(self):
        self.accept()
        self.user = self.scope['user'].__dict__['_wrapped']
        self.user.add_channel(self.channel_name)
        print(f'user <{self.user}> connected at', datetime.now().strftime('%H:%M:%S'))


    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        print(f'income from {self.user}:', data)
        request_type = data.get('type')
        method = getattr(self, request_type)
        method(data)


    def send_mails(self, useless_data=None, **kwargs):
        mod = self.mails_per_page + 1
        all_mails = self.user.received_mails.all()

        mails = all_mails.filter(deleted=False)[:self.received + mod]

        sent_mails = self.user.sent_mails.all()[:self.sent + mod]
        deleted_mails = all_mails.filter(deleted=True)[:self.deleted + mod]
        drafts = self.user.drafts.all()[:self.drafts + mod]

        mails_data = self.mail_serializer.get_data_for_json(queryset=mails)
        unread_data = all_mails.filter(deleted=False, read=False).count()
        sent_mails_data = self.mail_serializer.get_data_for_json(queryset=sent_mails)
        deleted_mails_data = self.mail_serializer.get_data_for_json(queryset=deleted_mails)
        drafts_data = self.draft_serializer.get_data_for_json(queryset=drafts)

        data = {
            'type': 'get_mails',
            'received': mails_data,
            'unread': unread_data,
            'sent': sent_mails_data,
            'deleted': deleted_mails_data,
            'drafts': drafts_data,
        }

        for k, v in kwargs.items():
            data[k] = v

        self.send(json.dumps(data))
        print(f'send to {self.user}:', data)


    def send_error(self, error):
        data = {
            'type': 'error',
            'error': error}
        self.send(json.dumps(data))


    def init(self, data):
        self.mails_per_page = data['mails_per_page']
        self.received = self.sent = self.deleted = self.drafts = self.mails_per_page
        self.send_mails()


    def get_mails(self, data):
        del data['type']
        for k, v in data.items():
            setattr(self, k, v)
        self.send_mails()


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

        self.send_mails(close_create_form=True)


    def delete_mails(self, data):
        id_list = data['mails_list']
        self.mail.objects.filter(id__in=id_list).update(deleted=True)

        self.send_mails()


    def recovery_mails(self, data):
        id_list = data['mails_list']
        self.mail.objects.filter(id__in=id_list).update(deleted=False)

        self.send_mails()


    def read_mails(self, data):
        id_list = data['mails_list']
        self.mail.objects.filter(id__in=id_list).update(read=True)

        self.send_mails()


    def create_draft(self, data):
        self.draft.objects.create(
            sender=self.user,
            receivers=' '.join(data['receivers']),
            subject=data['subject'],
            message=data['message']
        )

        self.send_mails(close_create_form=True)


    def save_draft(self, data):
        draft = self.draft.objects.get(id=data['id'])
        draft.receivers = ' '.join(data['receivers'])
        draft.subject = data['subject']
        draft.message = data['message']
        draft.save()

        self.send_mails()


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

        self.send_mails(close_create_form=True)


    def delete_drafts(self, data):
        id_list = data['drafts_list']
        self.draft.objects.filter(id__in=id_list).delete()

        self.send_mails()


    def signals_handler(self, event):
        del event['type']
        self.send_mails(**event)


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


    def disconnect(self, code):
        self.user.remove_channel()
        print(f'disconnecting by {self.user}: ', code)


    def create_test_mail(self, useless_data):
        user = User.objects.get(username='test_user')
        mail = self.mail.objects.create(
            sender=user,
            subject='test_mail',
            message='this is a test mail',
        )
        mail.receivers.add(self.user)
        mail.save()