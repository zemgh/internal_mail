from main.models import DelayedMail, Mail
from mail_server.celery import app


@app.task
def make_mail_from_delayed_mail(**kwargs):
    delayed_mail = DelayedMail.objects.get(pk=kwargs['delayed_mail_id'])

    Mail.objects.create(
        subject=delayed_mail.subject,
        message=delayed_mail.message,
        sender=delayed_mail.sender,
        receiver=delayed_mail.receiver
    )

    delayed_mail.delete()
    print('task completed')