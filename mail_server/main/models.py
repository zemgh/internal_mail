from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Mail(models.Model):
    subject = models.CharField(max_length=50)
    message = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='sent_mails')
    receivers = models.ManyToManyField(User, related_name='received_mails')
    created = models.DateTimeField(auto_now_add=True)
    answer_for = models.ForeignKey('Mail', on_delete=models.DO_NOTHING, null=True)
    deleted = models.BooleanField(default=False)
    deferred = models.BooleanField(default=False)
    deferred_datetime = models.DateTimeField(null=True)