import json
from datetime import datetime

from channels.generic.websocket import WebsocketConsumer
from main.consumer_mixins import ContactsMixin, ObjectHandler, FilterMixin, SenderMixin, UserMixin, \
    RequestsHandlerMixin, ValidatorsMixin, DemoMixin

from django.contrib.auth import get_user_model

User = get_user_model()


class MainConsumer(DemoMixin, WebsocketConsumer,
                   UserMixin, RequestsHandlerMixin, SenderMixin, ValidatorsMixin, ObjectHandler, FilterMixin,
                   ContactsMixin):

    def connect(self):
        self.accept()
        self.init_user()
        self.printlog(f'User <{self.user}> connected. Channel name: {self.channel_name}')

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        self.printlog(f'Data received from <{self.user}>: {data}')

        request_type = data.get('type')
        del data['type']
        method = getattr(self, request_type)
        method(data)

    def disconnect(self, code):
        self.user.channel = None
        self.user.save(update_fields=['channel'])
        self.printlog(f'User <{self.user}> has disconnected. Code: {code}')

    @staticmethod
    def printlog(text, warning=False):
        time = datetime.strftime(datetime.now(), '%d-%m-%y %H:%M:%S')
        warning_chars = '!' * 5
        if warning:
            print(f'{warning_chars}\n[{time}] {text}\n{warning_chars}')
        else:
            print(f'[{time}] {text}')