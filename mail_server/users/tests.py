import datetime
import uuid
from http import HTTPStatus
from importlib import import_module

from django.conf import settings
from django.test import TestCase, SimpleTestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from users.forms import UserLoginForm, UserRegisterForm, UserPasswordResetForm, UserPasswordChangeForm
from users.models import UserResetToken
from users.views import UserLoginView, UserRegistrationView, UserPasswordResetView, UserPasswordChangeView

User = get_user_model()


def create_test_user():
    user = User.objects.create_user(
        username='test_user_name',
        first_name='test_first_name',
        last_name='test_last_name',
        secret_word='test_secret_word',
        password='test-password-876'
    )
    return user


class UserModelTestCases(TestCase):
    def setUp(self):
        self.user = create_test_user()

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
        self.assertIsInstance(self.user.created, datetime.datetime)
        self.assertEqual(self.user.status, False)
        self.assertEqual(self.user.last_login, None)


    def test_secret_word(self):
        self.assertTrue(self.user.check_secret_word('test_secret_word'))


class UserResetTokenModelTestCase(TestCase):
    def setUp(self):
        self.user = create_test_user()
        self.token = UserResetToken.objects.create(user=self.user, session_key='test_session_key')

    def test_token_creation(self):
        self.assertEqual(self.token.user, self.user)
        self.assertIsInstance(self.token.uuid, uuid.UUID)
        self.assertIsInstance(self.token.created, datetime.datetime)
        self.assertEqual(self.token.session_key, 'test_session_key')


class TestAuthPagesTestCase(SimpleTestCase):
    def test_login_page(self):
        page = reverse('login')
        response = self.client.get(page)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertTemplateUsed(response, 'users/login.html')
        self.assertIsInstance(response.context['view'], UserLoginView)

    def test_register_page(self):
        page = reverse('register')
        response = self.client.get(page)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertTemplateUsed(response, 'users/register.html')
        self.assertIsInstance(response.context['view'], UserRegistrationView)

    def test_password_reset_page(self):
        page = reverse('password_reset')
        response = self.client.get(page)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertTemplateUsed(response, 'users/password_reset.html')
        self.assertIsInstance(response.context['view'], UserPasswordResetView)

    def test_password_change_page(self):
        page = reverse('password_change')
        response = self.client.get(page)
        self.assertEqual(response.status_code, HTTPStatus.OK)
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
            'username': 'test_user_name',
            'first_name': 'test_first_name',
            'last_name': 'test_last_name',
            'secret_word': 'test_secret_word',
            'password1': 'test-password-876',
            'password2': 'test-password-876'
        })
        self.assertRedirects(response, reverse('login'))
        self.user = User.objects.get(username='test_user_name')

    def password_reset_test(self):
        url = reverse('password_reset')
        response = self.client.post(url, {'username': self.user.username, 'secret_word': 'test_secret_word'})
        self.assertRedirects(response, reverse('password_change'))
        self.url = reverse('password_change')
        self.assertTrue(UserResetToken.objects.filter(user=self.user).exists())
        self.token = UserResetToken.objects.get(user=self.user)
        self.assertEqual(self.token.session_key, self.session.session_key)

    def password_change_test(self):
        self.new_password = 'test-password-876-reset'
        response = self.client.post(self.url, {'password_1': self.new_password, 'password_2': self.new_password, 'reset_token': self.token.uuid})
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

