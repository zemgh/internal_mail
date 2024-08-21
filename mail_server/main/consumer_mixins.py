import json
from datetime import timedelta, datetime

from main.models import Mail, DraftMail, DelayedMail
from main.serializers import ConsumerMailSerializer, ConsumerDraftSerializer
from main.tasks import make_mail_from_delayed_mail
from django.urls import reverse

from django.contrib.auth import get_user_model
User = get_user_model()


class UserMixin:
    user = None
    contacts = None

    def init_user(self):
        self.user = self.scope['user'].__dict__['_wrapped']
        self.contacts = self.user.get_contacts()
        if self.user.is_demo:
            self.demo_mod = True
            self.set_demo_user()
        self.user.channel = self.channel_name
        self.user.save(update_fields=['channel'])

    def update_user(self):
        self.user = User.objects.get(username=self.user.username)


class RequestsHandlerMixin:
    def init(self, data):
        self.mails_per_page_default = data['mails_per_page']
        if self.demo_mod:
            self.send_mails(demo=True)
        else:
            self.send_mails()
        self.send_contacts()

    def get_mails(self, data):
        methods = []
        for k, v in data.items():
            if v != 'default':
                setattr(self, 'mails_type', k)
                setattr(self, 'mails_number', v)
                method = getattr(self, 'send_' + k)
                methods.append(method)

            elif v == 'default':
                setattr(self, 'mails_number', None)
                setattr(self, 'mails_type', None)

        self.send_mails(methods=methods)

    def signals_handler(self, message):
        # if message.get('update_user'):
        #     self.update_user()
        methods = []
        for method in message['methods']:
            methods.append(getattr(self, method))
        self.send_mails(methods=methods)


class SenderMixin:
    mail_serializer = ConsumerMailSerializer
    draft_serializer = ConsumerDraftSerializer

    mails_per_page_default = None
    mails_type = None
    mails_number = None

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
        self.printlog(f'Sent data to <{self.user}>: {data}')

    def send_all_mails(self, **kwargs):
        send_data = {}
        methods = [self.send_received, self.send_sent, self.send_deleted, self.send_drafts]
        for method in methods:
            send_data.update(method())
        return send_data

    def send_received(self, **kwargs):
        number_of_mails = self.get_number_of_mails('received')

        if self.filter_type and self.filter_type == 'received':
            received_mails = self.user.received_mails.filter(deleted=False, **self.filter_options)[:number_of_mails]
        else:
            received_mails = self.user.received_mails.filter(deleted=False)[:number_of_mails]

        mails_data = self.mail_serializer.get_data_for_json(queryset=received_mails)
        self.update_user()
        unread_data = self.user.read_counter

        send_data = {'received': mails_data, 'unread': unread_data}
        return send_data

    def send_sent(self, **kwargs):
        number_of_mails = self.get_number_of_mails('sent')
        sent_mails = self.user.sent_mails.all()[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=sent_mails)
        send_data = {'sent': mails_data}
        return send_data

    def send_deleted(self, **kwargs):
        number_of_mails = self.get_number_of_mails('deleted')
        deleted_mails = self.user.received_mails.filter(deleted=True)[:number_of_mails]
        mails_data = self.mail_serializer.get_data_for_json(queryset=deleted_mails)
        send_data = {'deleted': mails_data}
        return send_data

    def send_drafts(self, **kwargs):
        number_of_mails = self.get_number_of_mails('drafts')
        drafts = self.user.drafts.all()[:number_of_mails]
        drafts_data = self.draft_serializer.get_data_for_json(queryset=drafts)
        send_data = {'drafts': drafts_data}
        return send_data

    def get_number_of_mails(self, mails_type):
        if self.mails_type == mails_type:
            return self.mails_number + self.mails_per_page_default + 1
        return self.mails_per_page_default * 2 + 1

    def send_command(self, command, **kwargs):
        data = {
            'type': 'command',
            'command': command
        }
        if kwargs:
            data.update(kwargs)
        self.send(json.dumps(data))
        self.printlog(f'Sent command to <{self.user}>: {command}')

    def send_error(self, error):
        data = {
            'type': 'error',
            'error': error}

        self.printlog(f'Sent error to <{self.user}>: {data}')
        self.send(json.dumps(data))


class ObjectHandler:
    mail = Mail
    draft = DraftMail
    delayed_mail = DelayedMail

    def create_mail(self, data):
        receiver = self.validate_user(data['receiver'])
        if not receiver:
            return self.send_error('Пользователя не существует!')

        self.mail.objects.create(
            sender=self.user,
            receiver=receiver,
            subject=data['subject'],
            message=data['message']
        )

        self.send_command(command='close_create_form')

    def delete_mails(self, data):
        id_list = data['mails_list']
        queryset = self.mail.objects.filter(id__in=id_list)
        for mail in queryset:
            if self.user != mail.receiver:
                return self.printlog(f'Ошибка удаления письма! user={self.user} mail_id={mail.id}', warning=True)
        queryset.update(deleted=True)

        self.send_mails(methods=[self.send_received, self.send_deleted])

    def recovery_mails(self, data):
        id_list = data['mails_list']
        queryset = self.mail.objects.filter(id__in=id_list)
        for mail in queryset:
            if self.user != mail.receiver:
                return self.printlog(f'Ошибка восстановления письма! user={self.user} mail_id={mail.id}', warning=True)
        queryset.update(deleted=False)

        self.send_mails(methods=[self.send_received, self.send_deleted])

    def read_mails(self, data):
        id_list = data['mails_list']
        queryset = self.mail.objects.filter(id__in=id_list, read=False)
        counter = queryset.count()
        for mail in queryset:
            if self.user != mail.receiver:
                return self.printlog(f'Ошибка чтения письма! user={self.user} mail_id={mail.id}', warning=True)

        queryset.update(read=True)
        self.user.read_counter -= counter
        self.user.save()

        method = getattr(self, 'send_' + data['method'])
        self.send_mails(methods=[method])

    def create_delayed_mail(self, data):
        dt = datetime.strptime(data['dt'], '%Y-%m-%d %H:%M')
        receiver = User.objects.get(username=data['receiver'])
        delayed_mail = self.delayed_mail.objects.create(
            subject=data['subject'],
            message=data['message'],
            sender=self.user,
            receiver=receiver,
            send_datetime=dt
        )

        make_mail_from_delayed_mail.apply_async(eta=dt, kwargs={'delayed_mail_id': delayed_mail.id})

        self.send_command(command='close_create_form')

    def create_draft(self, data):
        receiver = User.objects.get(username=data['receiver'])
        self.draft.objects.create(
            sender=self.user,
            receiver=receiver,
            subject=data['subject'],
            message=data['message']
        )

    def save_draft(self, data):
        draft = self.draft.objects.get(id=data['id'])
        draft.receiver = data['receiver']
        draft.subject = data['subject']
        draft.message = data['message']
        draft.save()

        self.send_mails(methods=[self.send_drafts])

    def convert_to_mail(self, data):
        receiver = self.validate_user(data['receiver'])
        if not receiver:
            return self.send_error('Такого пользователя не существует!')

        draft = self.draft.objects.get(id=data['id'])
        draft.convert_to_mail(receiver, data['subject'], data['message'])
        draft.delete()

        self.send_mails(methods=[self.send_received, self.send_drafts], command='close_create_form')

    def delete_drafts(self, data):
        id_list = data['drafts_list']
        queryset = self.draft.objects.filter(id__in=id_list)
        for draft in queryset:
            if self.user != draft.sender:
                return self.printlog(f'Ошибка удаления черновика! user={self.user} draft_id={draft.id}', warning=True)
        queryset.delete()

        self.send_mails(methods=[self.send_drafts])


class FilterMixin:
    filter_type = None
    _filter_options = None

    def filter(self, data):
        if data.get('reset'):
            self.filter_type = None
            self.filter_options = None
        else:
            self.filter_type = data['filter_type']
            self.filter_options = data['filter_options']

        method = getattr(self, f'send_{data['filter_type']}')
        self.send_mails(methods=[method])

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


class ContactsMixin:
    def send_contacts(self, add=False):
        data = {
            'type': 'get_contacts',
            'contacts': [user.username for user in self.contacts]
        }

        if add:
            data['add'] = True
        contacts_data = json.dumps(data)
        self.send(contacts_data)

    def add_user(self, data):
        user = self.validate_user(data['username'])

        if not user:
            return self.send_error('Такого пользователя не существует!')

        if user in self.contacts:
            return self.send_error('Этот пользователь уже в контактах!')

        self.user.contacts.add(user)
        self.user.save()
        self.contacts = self.user.get_contacts()

        self.send_contacts(add=True)

    def remove_user(self, data):
        user = self.validate_user(data['username'])

        if not user:
            return self.send_error('Такого пользователя не существует!')

        if user not in self.contacts:
            return self.send_error('Этот пользователь не в контактах!')

        self.user.contacts.remove(user)
        self.user.save()
        self.contacts = self.user.get_contacts()

        self.send_contacts()


class ValidatorsMixin:
    def validate_user(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return False


class DemoMixin:
    demo_mod = False
    test_user = None
    ping = 0

    def set_demo_user(self):
        test_user = self.get_test_user()
        admin = User.objects.get(username='admin')
        self.test_user = test_user

        if test_user not in self.contacts:
            self.user.contacts.add(test_user)
        if admin not in self.contacts:
            self.user.contacts.add(admin)

        self.user.save()
        self.contacts = self.user.get_contacts()


    def get_test_user(self):
        try:
            test_user = User.objects.get(username='test_user')
        except User.DoesNotExist:
            test_user = User.objects.create(
                username='test_user',
                first_name='Тестовый',
                last_name='Юзвер',
                secret_word='йцукен'
            )
        return test_user


    def create_test_mail(self, useless_data):
        if not self.demo_mod:
            return self.printlog(f'Демо режим не активирован! user={self.user}', warning=True)

        mail = self.mail.objects.create(
            sender=self.test_user,
            receiver=self.user,
            subject='Test mail',
            message='This is a test mail.',
        )

        self.printlog(f'Created test mail for <{mail.receiver}>')


    def create_test_delayed_mail(self, useless_data):
        if not self.demo_mod:
            return self.printlog(f'Демо режим не активирован! user={self.user}', warning=True)

        time = datetime.utcnow() + timedelta(seconds=10)
        delayed_mail = self.delayed_mail.objects.create(
            subject='Test delayed mail',
            message='This is a test delayed mail.',
            sender=self.test_user,
            receiver=self.user,
            send_datetime=time
        )

        make_mail_from_delayed_mail.apply_async(eta=time, kwargs={'delayed_mail_id': delayed_mail.id})
        self.printlog(f'Created test delayed mail for <{delayed_mail.receiver}>')


    def set_ping(self, useless_data):
        if not self.demo_mod:
            return self.printlog(f'Демо режим не активирован! user={self.user}', warning=True)

        if self.ping:
            self.ping = 0
        else:
            self.ping = 1

        self.send_command(command='set_ping', ping=self.ping)


    def logout_demo_user(self, useless_data):
        if not self.demo_mod:
            return self.printlog(f'Демо режим не активирован! user={self.user}', warning=True)

        url = reverse('login')
        self.send_command(command='logout', url=url)
        self.disconnect('no more demo mod :(')