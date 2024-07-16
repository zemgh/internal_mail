import json
from datetime import datetime

from channels.generic.websocket import WebsocketConsumer

from main.models import Mail
from main.serializers import MailSerializer


class TestConsumer(WebsocketConsumer):
    user = None
    mail = Mail
    mail_serializer = MailSerializer

    def connect(self):
        self.accept()
        self.user = self.scope['user']
        print(f'user <{self.user}> connected at', datetime.now().strftime('%H:%M:%S'))
        self.send_mails()

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        key = list(data.keys())[0]
        value = list(data.values())[0]
        options = {
            'delete_mails': self.delete_mails_handler
        }
        options[key](value)

    def delete_mails_handler(self, mails_list):
        self.mail.objects.filter(id__in=mails_list).delete()
        self.send_mails()


    def send_mails(self):
        mails = self.user.received_mails.all()
        mails_data = self.mail_serializer.get_data_for_json(queryset=mails)
        data = {'action': 'send_mail_list', 'mail_list': mails_data}
        self.send(json.dumps(data))




