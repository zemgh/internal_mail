import json
from datetime import datetime

from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model

from main.models import Mail
from main.serializers import MailSerializer

User = get_user_model()


class TestConsumer(WebsocketConsumer):
    user = None
    model_user = None
    mail = Mail
    mail_serializer = MailSerializer

    def connect(self):
        self.accept()
        self.user = self.scope['user']
        self.model_user = list(self.user.__dict__.values())[0]
        print(f'user <{self.user}> connected at', datetime.now().strftime('%H:%M:%S'))

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        print('income:', data)
        request_type = data.get('type')
        if request_type == 'get_mails':
            self.send_mails()
        elif request_type == 'create_mail':
            self.create_mail(data)
        elif request_type == 'delete_mails':
            self.delete_mails(data['mails_list'])
        elif request_type == 'recovery_mails':
            self.recovery_mails(data['mails_list'])
        elif request_type == 'read_mails':
            self.read_mails(data['mails_list'])
        elif request_type == 'create_test_mail':
            self.create_test_mail()


    def send_mails(self):
        all_mails = self.user.received_mails.all()

        mails = all_mails.filter(deleted=False)[:20]
        sent_mails = self.user.sent_mails.all()[:20]
        deleted_mails = all_mails.filter(deleted=True)[:20]

        mails_data = self.mail_serializer.get_data_for_json(queryset=mails)
        sent_mails_data = self.mail_serializer.get_data_for_json(queryset=sent_mails)
        deleted_mails_data = self.mail_serializer.get_data_for_json(queryset=deleted_mails)

        data = {
            'type': 'get_mails',
            'received': mails_data,
            'sent': sent_mails_data,
            'deleted': deleted_mails_data}

        self.send(json.dumps(data))
        print('send:', data)


    def create_mail(self, new_mail):
        mail = self.mail.objects.create(
            sender=self.model_user,
            subject=new_mail['subject'],
            message=new_mail['message']
        )
        receivers = User.objects.filter(username__in=new_mail['receivers'])
        mail.receivers.set(receivers)
        mail.save()

        self.send_mails()


    def delete_mails(self, mails_list):
        self.mail.objects.filter(id__in=mails_list).update(deleted=True)

        self.send_mails()


    def recovery_mails(self, mails_list):
        self.mail.objects.filter(id__in=mails_list).update(deleted=False)

        self.send_mails()


    def read_mails(self, mails_list):
        self.mail.objects.filter(id__in=mails_list).update(read=True)

        self.send_mails()


    def disconnect(self, code):
        print('disconnecting: ', code)

    def create_test_mail(self):
        user = User.objects.get(username='test_user')
        mail = self.mail.objects.create(
            sender=user,
            subject='test_mail',
            message='this is a test mail',
        )
        mail.receivers.add(self.model_user)
        mail.save()

        self.send_mails()
