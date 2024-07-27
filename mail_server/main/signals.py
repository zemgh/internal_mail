from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from main.models import Mail


@receiver(post_save, sender=Mail)
def new_mail(sender, instance, created, **kwargs):
    if not created:
        receivers = instance.receivers.all()
        for user in receivers:
            channel_layer = get_channel_layer()
            channel_name = user.channel
            message = {'type': 'send_mails'}
            async_to_sync(channel_layer.send)(channel_name, message)
