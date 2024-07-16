import datetime
import uuid
from importlib import import_module

from django.conf import settings
from django.core.exceptions import ValidationError
from django.test import TestCase, SimpleTestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from users.forms import UserLoginForm, UserRegisterForm, UserPasswordResetForm, UserPasswordChangeForm
from users.models import UserResetToken, UserValidators
from users.views import UserLoginView, UserRegistrationView, UserPasswordResetView, UserPasswordChangeView


class TestUser:
    model = get_user_model()
    username = 'test_user_name'
    first_name = 'Петя'
    last_name = 'Петечкин'
    secret_word = 'секрет'
    password = 'test_password_123'
    counter = 0

    @classmethod
    def create_test_user(cls, multiple=False):
        def create_multiple_users_name():
            username = f'{cls.username}-{cls.counter}'
            cls.counter += 1
            return username

        user = cls.model.objects.create(
            username=cls.username if not multiple else create_multiple_users_name(),
            first_name=cls.first_name,
            last_name=cls.last_name,
            secret_word=cls.secret_word,
            password=cls.password
        )

        return user


class UserModelTestCases(TestCase):
    def setUp(self):
        self.user = TestUser.create_test_user()

    def test_user_creation(self):
        self.assertIsInstance(self.user, TestUser.model)
        self.assertEqual(self.user.username, TestUser.username)
        self.assertEqual(self.user.first_name, TestUser.first_name)
        self.assertEqual(self.user.last_name, TestUser.last_name)
        self.assertTrue(self.user.secret_word)

    def test_user_str(self):
        self.assertEqual(self.user.__str__(), TestUser.username)

    def test_user_full_name(self):
        full_name = self.user.get_full_name()
        self.assertEqual(full_name, f'{TestUser.last_name} {TestUser.first_name}')

    def test_default_attributes(self):
        self.assertEqual(self.user.is_active, True)
        self.assertEqual(self.user.is_staff, False)
        self.assertIsInstance(self.user.created, datetime.datetime)
        self.assertEqual(self.user.status, False)

    def test_secret_word(self):
        self.assertTrue(self.user.check_secret_word(TestUser.secret_word))


class UserResetTokenModelTestCase(TestCase):
    user = None
    token = None

    def setUp(self):
        self.user = TestUser.create_test_user()
        self.token = UserResetToken.objects.create(user=self.user, session_key='test_session_key')

    def test_token_creation(self):
        self.assertEqual(self.token.user, self.user)
        self.assertIsInstance(self.token.uuid, uuid.UUID)
        self.assertIsInstance(self.token.created, datetime.datetime)
        self.assertEqual(self.token.session_key, 'test_session_key')


class GetPagesTestCase(SimpleTestCase):
    def test_login_page(self):
        page = reverse('login')
        response = self.client.get(page)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/login.html')
        self.assertIsInstance(response.context['view'], UserLoginView)

    def test_register_page(self):
        page = reverse('register')
        response = self.client.get(page)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/register.html')
        self.assertIsInstance(response.context['view'], UserRegistrationView)

    def test_password_reset_page(self):
        page = reverse('password_reset')
        response = self.client.get(page)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/password_reset.html')
        self.assertIsInstance(response.context['view'], UserPasswordResetView)

    def test_password_change_page(self):
        page = reverse('password_change')
        response = self.client.get(page)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'users/password_change.html')
        self.assertIsInstance(response.context['view'], UserPasswordChangeView)


class UserFormsTestCase(SimpleTestCase):
    def test_login_form(self):
        form_class = UserLoginForm
        url = reverse('login')
        response = self.client.get(url)
        form = response.context['form']
        self.assertIsInstance(form, form_class)
        self.assertContains(response, 'csrfmiddlewaretoken')

    def test_register_form(self):
        form_class = UserRegisterForm
        url = reverse('register')
        response = self.client.get(url)
        form = response.context['form']
        self.assertIsInstance(form, form_class)
        self.assertContains(response, 'csrfmiddlewaretoken')

    def test_password_reset_form(self):
        form_class = UserPasswordResetForm
        url = reverse('password_reset')
        response = self.client.get(url)
        form = response.context['form']
        self.assertIsInstance(form, form_class)
        self.assertContains(response, 'csrfmiddlewaretoken')

    def test_password_change_form(self):
        form_class = UserPasswordChangeForm
        url = reverse('password_change')
        response = self.client.get(url)
        form = response.context['form']
        self.assertIsInstance(form, form_class)
        self.assertContains(response, 'csrfmiddlewaretoken')


class UserResetPasswordAlgorithmTestCase(TestCase):
    user = None
    session = None
    url = None

    def setUp(self):
        session_engine = import_module(settings.SESSION_ENGINE)
        self.session = session_engine.SessionStore()
        self.session.save()
        self.client.cookies[settings.SESSION_COOKIE_NAME] = self.session.session_key

    def register_test(self):
        url = reverse('register')
        response = self.client.post(url, {
            'username': TestUser.username,
            'first_name': TestUser.first_name,
            'last_name': TestUser.last_name,
            'secret_word': TestUser.secret_word,
            'password1': TestUser.password,
            'password2': TestUser.password
        })
        self.assertRedirects(response, reverse('login'))
        self.user = TestUser.model.objects.get(username=TestUser.username)

    def password_reset_test(self):
        url = reverse('password_reset')
        response = self.client.post(url, {'username': self.user.username, 'secret_word': TestUser.secret_word})
        self.assertRedirects(response, reverse('password_change'))
        self.url = reverse('password_change')
        self.assertTrue(UserResetToken.objects.filter(user=self.user).exists())
        self.token = UserResetToken.objects.get(user=self.user)
        self.assertEqual(self.token.session_key, self.session.session_key)

    def password_change_test(self):
        self.new_password = TestUser.password + '-reset'
        response = self.client.post(self.url, {'password_1': self.new_password, 'password_2': self.new_password,
                                               'reset_token': self.token.uuid})
        self.assertRedirects(response, reverse('login'))
        self.url = reverse('login')

    def login_test(self):
        response = self.client.post(self.url, {'username': self.user.username, 'password': self.new_password})
        self.assertRedirects(response, reverse('main'))
        self.assertTrue(self.user.is_authenticated)

    def test_all(self):
        self.register_test()
        self.password_reset_test()
        self.password_change_test()
        self.login_test()


class UserValidatorsTest(TestCase):
    user = None
    symbols = '`!@#$%^&*()+{}[]<>\'":;?/,.|\\'

    def setUp(self):
        self.user = TestUser.create_test_user()

    def test_username_validator(self):
        validator = UserValidators.validate_username
        not_allowed_chars = self.symbols
        for char in not_allowed_chars:
            self.assertRaises(ValidationError, validator, 'test' + char)
        self.assertRaises(ValidationError, validator, 'ab')

    def test_name_validator(self):
        validator = UserValidators.validate_names
        not_allowed_chars = (self.symbols +
                             UserValidators.latin_chars +
                             UserValidators.latin_chars.upper())
        for char in not_allowed_chars:
            self.assertRaises(ValidationError, validator, 'абв' + char)

    def test_secret_word_validator(self):
        validator = UserValidators.validate_secret_word
        not_allowed_chars = (self.symbols +
                             UserValidators.latin_chars +
                             UserValidators.latin_chars.upper() +
                             UserValidators.cyrillic_chars.upper())
        for char in not_allowed_chars:
            self.assertRaises(ValidationError, validator, 'абвгд' + char)
        self.assertRaises(ValidationError, validator, 'абвгд')
