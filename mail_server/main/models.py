import copy
import datetime

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Mail(models.Model):
    class Meta:
        ordering = ['-created']

    subject = models.CharField(max_length=50)
    message = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='sent_mails')
    receivers = models.ManyToManyField(User, related_name='received_mails')
    created = models.DateTimeField(auto_now_add=True)
    answer_for = models.ForeignKey('Mail', on_delete=models.DO_NOTHING, null=True, blank=True)
    deleted = models.BooleanField(default=False)
    read = models.BooleanField(default=False)
    deferred = models.BooleanField(default=False)
    deferred_datetime = models.DateTimeField(null=True, blank=True)

    import copy

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
