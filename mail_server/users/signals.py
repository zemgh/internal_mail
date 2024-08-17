from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from main.models import Mail

User = get_user_model()


@receiver(post_save, sender=User)
def new_user(sender, instance, created, **kwargs):
    if created and instance.username not in ('admin', 'service', 'test_user'):
        admin = sender.objects.get(username='admin')
        service = sender.objects.get(username='service')
        Mail.objects.create(
            subject='new user',
            message=f'registered new user {f'demo {instance.id}' if instance.is_demo else instance.username}',
            receiver=admin,
            sender=service
        )
