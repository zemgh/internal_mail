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
        print(data)
        request_type = data.get('type')
        if request_type == 'get_mails':
            self.send_mails()
        elif request_type == 'delete_mails':
            self.delete_mails(data['mails_list'])
        elif request_type == 'create_mail':
            self.create_mail(data)

    def create_mail(self, new_mail):
        print(self.user, type(self.user))
        mail = self.mail.objects.create(
            sender=self.model_user,
            subject=new_mail['subject'],
            message=new_mail['message']
        )
        receivers = User.objects.filter(username__in=new_mail['receivers'])
        print('receivers ', receivers)
        mail.receivers.set(receivers)
        mail.save()
        print(mail.__dict__)
        self.send_mails()


    def delete_mails(self, mails_list):
        self.mail.objects.filter(id__in=mails_list).update(deleted=True)
        self.user.unread_counter -= len(mails_list)

        self.send_mails()

    def send_mails(self):
        all_mails = self.user.received_mails.all()
        mails = all_mails.filter(deleted=False)
        deleted_mails = all_mails.filter(deleted=True)

        mails_data = self.mail_serializer.get_data_for_json(queryset=mails)
        deleted_mails_data = self.mail_serializer.get_data_for_json(queryset=deleted_mails)
        data = {
            'type': 'get_mails',
            'mails_list': mails_data,
            'deleted_mails_list': deleted_mails_data}

        self.send(json.dumps(data))

    def disconnect(self, code):
        print('disconnecting: ', code)


