from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from main.models import Mail, DraftMail


def send(layer, user, methods, **kwargs):
    channel_name = user.channel
    if channel_name:
        message = {'type': 'signals_handler', 'methods': methods}
        if kwargs:
            message.update(kwargs)
        async_to_sync(layer.send)(channel_name, message)


@receiver(post_save, sender=Mail)
def new_mail(sender, instance, created, **kwargs):
    if created:
        user = instance.receiver
        user.read_counter += 1
        user.save()

        channel_layer = get_channel_layer()
        send(channel_layer, instance.sender, ['send_sent'])
        send(channel_layer, instance.receiver, ['send_received'], update_user=True)


@receiver(post_save, sender=DraftMail)
def new_draft(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        send(channel_layer, instance.sender, ['send_drafts'])