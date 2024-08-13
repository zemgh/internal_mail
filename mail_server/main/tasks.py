from main.models import DelayedMail, Mail
from mail_server.celery import app


@app.task
def make_mail_from_delayed_mail(**kwargs):
    try:
        delayed_mail = DelayedMail.objects.get(pk=kwargs['delayed_mail_id'])
        delayed_mail.convert_to_mail()
        delayed_mail.delete()
        print('Task completed /make_mail_from_delayed_mail/')

    except DelayedMail.DoesNotExist:
        print(f'*** Delayed_mail (id={kwargs['delayed_mail_id']}) not found /make_mail_from_delayed_mail/')
