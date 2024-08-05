import json
from datetime import datetime, date, timedelta

from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model

from main.models import Mail, DraftMail, DelayedMail
from main.serializers import MailSerializer, DraftSerializer

from time import sleep

User = get_user_model()


class MainConsumer(WebsocketConsumer):
    user = None
    contacts = None
    contacts_list = None

    mail = Mail
    mail_serializer = MailSerializer
    draft = DraftMail
    draft_serializer = DraftSerializer
    delayed_mail = DelayedMail

    mails_per_page_default = None
    mails_per_page_current = None
    mails_per_page_type = None

    filter_type = None
    _filter_options = None

    def connect(self):
        self.accept()
        self.init_user()
        print(f'\nuser <{self.user}> connected at', datetime.now().strftime('%H:%M:%S'), f'\nchannel name: {self.channel_name}\n')


    def receive(self, text_data=None, bytes_data=None):
        sleep(0.5)
        data = json.loads(text_data)
        print(f'income from {self.user}:', data)

        request_type = data.get('type')
        del data['type']
        method = getattr(self, request_type)
        method(data)


    def disconnect(self, code):
        self.user.channel = None
        self.user.save(update_fields=['channel'])
        print(f'disconnecting by {self.user}: ', code)


    def init_user(self):
        self.user = self.scope['user'].__dict__['_wrapped']
        self.contacts = self.user.contacts.all()
        self.contacts_list = list(sorted(self.contacts.values_list('username', flat=True)))
        self.user.channel = self.channel_name
        self.user.save(update_fields=['channel'])


    def send_mails(self, methods=None, **kwargs):
        data = {
            'type': 'get_mails'
        }

        if not methods:
            data.update(self.send_all_mails())
        else:
            for method in methods:
                mails = method()
                data.update(mails)

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
        number_of_mails = self.get_number_of_mails('received')

        if self.filter_type and self.filter_type == 'received':
            received_mails = self.user.received_mails.filter(deleted=False, **self.filter_options)[:number_of_mails]
        else:
            received_mails = self.user.received_mails.filter(deleted=False)[:number_of_mails]

        mails_data = self.mail_serializer.get_data_for_json(queryset=received_mails)
        unread_data = self.user.received_mails.filter(deleted=False, read=False).count()
        send_data = {'received': mails_data, 'unread': unread_data}
        return send_data


    def send_sent(self):
        number_of_mails = self.get_number_of_mails('sent')
        sent_mails = self.user.sent_mails.all()[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=sent_mails)
        send_data = {'sent': mails_data}
        return send_data


    def send_deleted(self):
        number_of_mails = self.get_number_of_mails('deleted')
        deleted_mails = self.user.received_mails.filter(deleted=True)[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=deleted_mails)
        send_data = {'deleted': mails_data}
        return send_data


    def send_drafts(self):
        number_of_mails = self.get_number_of_mails('drafts')
        drafts = self.user.drafts.all()[:number_of_mails]
        drafts_data = self.draft_serializer.get_data_for_json(queryset=drafts)
        send_data = {'drafts': drafts_data}
        return send_data


    def get_number_of_mails(self, mails_type):
        if self.mails_per_page_type == mails_type:
            return self.mails_per_page_current + self.mails_per_page_default + 1
        return self.mails_per_page_default * 2 + 1


    @property
    def filter_options(self):
        return self._filter_options

    @filter_options.setter
    def filter_options(self, options):
        fields = {}
        for k, v in options.items():
            if k in ('username', 'first_name', 'last_name'):
                fields[f'sender__{k}__icontains'] = v
            elif k == 'first_date':
                fields['created__gte'] = datetime.strptime(v, '%Y-%m-%d')
            elif k == 'last_date':
                fields['created__lte'] = datetime.strptime(v, '%Y-%m-%d') + timedelta(days=1)
        self._filter_options = fields


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
        self.mails_per_page_default = data['mails_per_page']
        self.send_mails()
        self.send_contacts()


    def get_mails(self, data):
        methods = []
        for k, v in data.items():
            if v != 'default':
                setattr(self, 'mails_per_page_type', k)
                setattr(self, 'mails_per_page_current', v)
                method = getattr(self, 'send_' + k)
                methods.append(method)

            elif v == 'default':
                setattr(self, 'mails_per_page_current', None)
                setattr(self, 'mails_per_page_type', None)

        self.send_mails(methods=methods)


    def filter(self, data):
        if data.get('reset'):
            self.filter_type = None
            self.filter_options = None
        else:
            self.filter_type = data['filter_type']
            self.filter_options = data['filter_options']

        method = getattr(self, f'send_{data['filter_type']}')
        self.send_mails(methods=[method])


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


    def create_delayed_mail(self, data):
        dt = f'{data["date"]} {data["time"]}'
        dt = datetime.strptime(dt, '%Y-%m-%d %H:%M')
        delayed_mail = self.delayed_mail.objects.create(
            subject=data['subject'],
            message=data['message'],
            sender=self.user,
            send_datetime=dt
        )
        receivers = User.objects.filter(username__in=data['receivers'])
        delayed_mail.receivers.set(receivers)

        self.send_command('close_create_form')


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


    def send_contacts(self, add=False):
        data = {
            'type': 'get_contacts',
            'contacts': self.contacts_list
        }
        if add:
            data['add'] = True
        contacts_data = json.dumps(data)
        self.send(contacts_data)


    def add_user(self, data):
        validate = self.validate_receivers([data['username'], ])

        if validate != 'correct':
            return self.send_error(validate)

        if data['username'] in self.contacts_list:
            return self.send_error('Этот пользователь уже в контактах!')

        user = User.objects.get(username=data['username'])
        self.user.contacts.add(user)
        self.user.save()
        self.contacts = self.user.contacts.all()
        self.contacts_list = list(sorted(self.contacts.values_list('username', flat=True)))

        self.send_contacts(add=True)


    def remove_user(self, data):
        user = User.objects.get(username=data['username'])
        self.user.contacts.remove(user)
        self.user.save()
        self.contacts = self.user.contacts.all()
        self.contacts_list.remove(user.username)

        self.send_contacts()

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
        try:
            user = User.objects.get(username='test_user')
        except User.DoesNotExist:
            user = User.objects.create_user(
                username='test_user',
                first_name='Тестовый',
                last_name='Юзвер',
                secret_word='йцукен'
            )

        mail = self.mail.objects.create(
            sender=user,
            subject='test_mail',
            message='this is a test mail',
        )
        mail.receivers.add(self.user)
        mail.save()
        print(f'sended test mail to {', '.join([user.username for user in mail.receivers.all()])}')