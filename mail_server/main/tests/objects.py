from datetime import datetime, timezone

from main.models import Mail, DelayedMail, DraftMail
from users.tests.tests import TestUser


class BaseTestObjects:
    user = lambda: TestUser.create_test_user(multiple=True)


class TestMail(BaseTestObjects):
    model = Mail
    subject = 'Test mail subject'
    message = 'Test mail message'

    @classmethod
    def create_test_mail(cls):
        mail = cls.model.objects.create(
            subject=cls.subject,
            message=cls.message,
            sender=cls.user(),
            receiver=cls.user()
        )
        return mail


class TestDelayedMail(BaseTestObjects):
    model = DelayedMail
    subject = 'Test delayed mail subject'
    message = 'Test delayed mail message'

    @classmethod
    def create_test_delayed_mail(cls):
        delayed_mail = cls.model.objects.create(
            subject=cls.subject,
            message=cls.message,
            sender=cls.user(),
            receiver=cls.user(),
            send_datetime=datetime.now(tz=timezone.utc)
        )
        return delayed_mail


class TestDraftMail(BaseTestObjects):
    model = DraftMail
    subject = 'Test draft subject'
    message = 'Test draft message'

    @classmethod
    def create_test_draft_mail(cls) -> Mail:
        draft_mail = cls.model.objects.create(
            subject=cls.subject,
            message=cls.message,
            sender=cls.user(),
            receiver='draft receiver'
        )
        return draft_mail