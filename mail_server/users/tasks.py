from asgiref.sync import async_to_sync
from celery.exceptions import Ignore
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model, logout

from mail_server.celery import app
from main.models import Mail

User = get_user_model()


@app.task
def deactivate_demo_user(**kwargs):
    try:
        user = User.objects.get(pk=kwargs['user_id'])
        user.is_active = False
        user.save()

        channel_layer = get_channel_layer()
        channel_name = user.channel
        async_to_sync(channel_layer.send)(channel_name, {'type': 'logout_demo_user'})

        print(f'{user} deactivated /deactivate_demo_user/')

    except User.DoesNotExist:
        print(f'*** User (id={kwargs['user_id']}) not found /deactivate_demo_user/')


@app.task
def create_hello_mail(**kwargs):
    admin = User.objects.get(username='admin')

    try:
        user = User.objects.get(pk=kwargs['user_id'])

        message = f'''Приветствую!
        
        Вы находитесь в демонстрационном режиме.
        
        Вам доступны следующие опции (внизу справа):
            - Получить тестовое письмо
            - Получить отложенное тестовое письмо
            - Увеличить/уменьшить пинг (имитация)
            
        Логин            "{user}"    
        Пароль           "demo_user_password_123"
        Секретное слово  "йцукен"
        
        Аккаунт будет автоматически деактивирован через сутки. 
        '''
        Mail.objects.create(
            subject='Приветственное письмо',
            message=message,
            sender=admin,
            receiver=user,
        )
        print(f'Hello mail for demo user (id={kwargs['user_id']}) created /create_hello_mail/')

    except User.DoesNotExist:
        print(f'*** User (id={kwargs['user_id']}) not found /create_hello_mail/')


