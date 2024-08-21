from django.contrib.auth import get_user_model
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView, CreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from mail_server.exceptions import ListTypeException, BadParametersException, ObjectAccessDeniedException, \
    WrongFieldsException
from main.models import Mail, DelayedMail
from main.serializers import MailSerializer, MailListSerializer, DelayedMailSerializer

User = get_user_model()


class MailListAPI(ListAPIView):
    queryset = Mail.objects.all()
    serializer_class = MailListSerializer
    pagination_class = PageNumberPagination
    allowed_types = [None, 'received', 'sent', 'deleted']

    def get(self, request, *args, **kwargs):
        self.list_type = self.request.query_params.get('type', 'received')
        if self.list_type in self.allowed_types:
            return super().get(request, *args, **kwargs)
        raise ListTypeException({'error': f"List type '{self.list_type}' not supported"})

    def get_queryset(self):
        method = getattr(self, self.list_type)
        return method()

    def received(self):
        read = self.request.query_params.get('read')
        if read:
            return self.queryset.filter(receiver=self.request.user, deleted=False, read=read)
        return self.queryset.filter(receiver=self.request.user, deleted=False)

    def sent(self):
        return self.queryset.filter(sender=self.request.user)

    def deleted(self):
        return self.queryset.filter(receiver=self.request.user, deleted=True)


class MailAPI(RetrieveUpdateAPIView):
    queryset = Mail.objects.all()
    serializer_class = MailSerializer
    allowed_keys = ['read', 'deleted']
    allowed_values = {
        'read': ['True', 'False', 'true', 'false'],
        'deleted': ['True', 'False', 'true', 'false']
    }

    def patch(self, request, *args, **kwargs):
        for k, v in request.data.items():
            if k not in self.allowed_keys:
                raise BadParametersException({'error': f"Key '{k}' not supported. Allowed only {self.allowed_keys}"})
            if v not in self.allowed_values[k]:
                raise BadParametersException({'error': f"Value '{v}' not supported. Allowed only {self.allowed_values[k]}"})

        return super().patch(request, *args, **kwargs)

    def get_object(self):
        obj = super().get_object()
        if self.request.user not in [obj.receiver, obj.sender]:
            raise ObjectAccessDeniedException({'error': f'{self.request.user} is not allowed to read or modify {obj}'})
        return obj


class CreateMailAPI(CreateAPIView):
    queryset = Mail.objects.all()
    serializer_class = MailSerializer
    allowed_fields = {'receiver', 'subject', 'message', 'answer_for'}
    required_fields = {'receiver', 'subject', 'message'}

    def post(self, request, *args, **kwargs):
        self.set_type()
        return super().post(request, *args, **kwargs)

    def set_type(self):
        if self.request.data.get('delayed'):
            del self.request.data['delayed']
            self.queryset = DelayedMail.objects.all()
            self.serializer_class = DelayedMailSerializer
            self.allowed_fields = {'receiver', 'subject', 'message', 'send_datetime'}
            self.required_fields = self.allowed_fields
        self.check_fields()

    def check_fields(self):
        fields_set = set(self.request.data.keys())

        if not self.required_fields.issubset(fields_set):
            raise WrongFieldsException({'error': f"Not enough fields provided. There must be at least {self.required_fields}"})

        difference = self.required_fields.difference(fields_set)
        if difference:
            raise WrongFieldsException({'error': f"Wrong fields provided: {list(difference)}"})

    def create(self, request, *args, **kwargs):
        fields = {}
        for k, v in request.data.items():
            fields[k] = v

        try:
            receiver = User.objects.get(username=fields['receiver'])
            fields['receiver'] = receiver
        except User.DoesNotExist:
            raise User.DoesNotExistException({'error': f'User {fields['receiver']} nor found.'})

        fields['sender'] = self.request.user
        obj = self.queryset.create(**fields)
        sr_data = self.serializer_class(obj).data
        return Response(sr_data)









