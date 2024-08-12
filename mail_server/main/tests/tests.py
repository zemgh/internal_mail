import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase, SimpleTestCase
from django.urls import reverse

from main.tests.objects import TestMail, TestDelayedMail, TestDraftMail
from users.tests.tests import TestUser

User = get_user_model()


class GetPagesTestCase(SimpleTestCase):
    def test_main_page(self):
        main_page = reverse('main')
        response = self.client.get(main_page)
        self.assertEqual(response.status_code, 302)


class MailModelTestCase(TestCase):
    mail = None

    def setUp(self):
        self.mail = TestMail.create_test_mail()

    def test_mail_creation(self):
        self.assertIsInstance(self.mail, TestMail.model)
        self.assertEqual(self.mail.subject, TestMail.subject)
        self.assertEqual(self.mail.message, TestMail.message)
        self.assertIsInstance(self.mail.sender, TestUser.model)
        self.assertIsInstance(self.mail.receiver, TestUser.model)

    def test_default_attributes(self):
        self.assertIsInstance(self.mail.created, datetime.datetime)
        self.assertEqual(self.mail.answer_for, None)
        self.assertEqual(self.mail.deleted, False)
        self.assertEqual(self.mail.read, False)



class DelayedMailModelTestCase(TestCase):
    delayed_mail = None

    def setUp(self):
        self.delayed_mail = TestDelayedMail.create_test_delayed_mail()

    def test_delayed_mail_creation(self):
        self.assertIsInstance(self.delayed_mail, TestDelayedMail.model)
        self.assertEqual(self.delayed_mail.subject, TestDelayedMail.subject)
        self.assertEqual(self.delayed_mail.message, TestDelayedMail.message)
        self.assertIsInstance(self.delayed_mail.sender, TestUser.model)
        self.assertIsInstance(self.delayed_mail.receiver, TestUser.model)

    def test_default_attributes(self):
        self.assertIsInstance(self.delayed_mail.created, datetime.datetime)
        self.assertIsInstance(self.delayed_mail.send_datetime, datetime.datetime)


class DraftMailTestCase(TestCase):
    draft_mail = None

    def setUp(self):
        self.draft_mail = TestDraftMail.create_test_draft_mail()

    def test_delayed_mail_creation(self):
        self.assertIsInstance(self.draft_mail, TestDraftMail.model)
        self.assertIsInstance(self.draft_mail.sender, TestUser.model)
        self.assertIsInstance(self.draft_mail.receiver, str)
        self.assertEqual(self.draft_mail.subject, TestDraftMail.subject)
        self.assertEqual(self.draft_mail.message, TestDraftMail.message)

    def test_default_attributes(self):
        self.assertIsInstance(self.draft_mail.created, datetime.datetime)