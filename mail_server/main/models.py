import copy
import datetime

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class BaseMailsModel:
    @property
    def get_datetime(self):
        current_dt = datetime.datetime.now()
        created_dt = copy.deepcopy(self.created)
        created_dt += datetime.timedelta(hours=3)

        if current_dt.strftime('%d%m%Y') == created_dt.strftime('%d%m%Y'):
            data = {
                'short': created_dt.strftime('%H:%M'),
                'long': created_dt.strftime('Сегодня в %H:%M')
            }
            return data

        current_year = datetime.datetime.now().year == created_dt.year
        data = {
            'short': created_dt.strftime('%d %b') if current_year else created_dt.strftime('%d %b %Y'),
            'long': created_dt.strftime('%d %b %Y в %H:%M')
        }
        return data


class Mail(models.Model, BaseMailsModel):
    class Meta:
        ordering = ['-created']

    subject = models.CharField(max_length=50)
    message = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='sent_mails')
    receiver = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='received_mails')
    answer_for = models.ForeignKey('Mail', on_delete=models.DO_NOTHING, null=True, blank=True)
    deleted = models.BooleanField(default=False)
    read = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)


class DelayedMail(models.Model, BaseMailsModel):
    class Meta:
        ordering = ['-created']
    subject = models.CharField(max_length=50)
    message = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='delayed_mails')
    receiver = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    send_datetime = models.DateTimeField()
    created = models.DateTimeField(auto_now_add=True)


class DraftMail(models.Model, BaseMailsModel):
    class Meta:
        ordering = ['-created']

    subject = models.CharField(max_length=50, blank=True)
    message = models.TextField(blank=True)
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='drafts')
    receiver = models.CharField(max_length=50, blank=True)
    created = models.DateTimeField(auto_now_add=True)

