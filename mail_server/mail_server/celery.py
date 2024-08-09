import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mail_server.settings')
app = Celery('mail_server')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
broker_connection_retry = True
broker_connection_retry_on_startup = True
