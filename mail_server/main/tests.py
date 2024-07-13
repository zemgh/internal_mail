import datetime

from django.test import TestCase, SimpleTestCase
from django.urls import reverse

from main.models import Mail
from users.tests import TestUser


class TestMail:
    model = Mail
    subject = 'Test mail subject'
    message = 'Test mail message'
    user = TestUser.create_test_user


    @classmethod
    def create_test_mail(cls):
        mail = cls.model.objects.create(
            subject=cls.subject,
            message=cls.message,
            sender=cls.user()
        )
        mail.receivers.set([cls.user(), cls.user()])
        mail.save()
        return mail



class GetPagesTestCase(TestCase):
    def test_main_page(self):
        main_page = reverse('main')
        response = self.client.get(main_page)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'main/main.html')


class MailModelTestCase(TestCase):
    mail = None

    def setUp(self):
        self.mail = TestMail.create_test_mail()

    def test_mail_creation(self):
        self.assertIsInstance(self.mail, TestMail.model)
        self.assertEqual(self.mail.subject, TestMail.subject)
        self.assertIsInstance(self.mail.sender, TestUser.model)
        self.assertEqual(self.mail.receivers.count(), 2)

    def test_default_attributes(self):
        self.assertIsInstance(self.mail.created, datetime.datetime)
        self.assertEqual(self.mail.answer_for, None)
        self.assertEqual(self.mail.deleted, False)
        self.assertEqual(self.mail.deferred, False)
        self.assertEqual(self.mail.deferred_datetime, None)
