import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()


class UserModelTestCases(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='test_user_name',
            first_name='test_first_name',
            last_name='test_last_name',
            secret_word='test_secret_word'
        )

    def test_user_creation(self):
        self.assertIsInstance(self.user, User)
        self.assertEqual(self.user.username, 'test_user_name')
        self.assertEqual(self.user.first_name, 'test_first_name')
        self.assertEqual(self.user.last_name, 'test_last_name')
        self.assertTrue(self.user.secret_word)

    def test_user_str(self):
        self.assertEqual(self.user.__str__(), 'test_user_name')

    def test_user_full_name(self):
        full_name = self.user.get_full_name()
        self.assertEqual(full_name, 'test_last_name test_first_name')

    def test_default_attributes(self):
        self.assertEqual(self.user.is_active, True)
        self.assertEqual(self.user.is_staff, False)
        self.assertEqual(type(self.user.created), datetime.datetime)
        self.assertEqual(self.user.status, False)
        self.assertEqual(self.user.last_login, None)


    def test_secret_word(self):
        self.assertTrue(self.user._check_secret_word('test_secret_word'))