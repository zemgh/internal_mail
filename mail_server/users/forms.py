from django.contrib.auth import get_user_model
from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.password_validation import validate_password
from django.utils.safestring import mark_safe


class UserLoginForm(AuthenticationForm):
    class Meta:
        model = get_user_model()
        fields = ['username', 'password']


class UserRegisterForm(UserCreationForm):
    class Meta:
        model = get_user_model()
        fields = ['username', 'first_name', 'last_name', 'secret_word']
        labels = {
            'first_name': 'Имя',
            'last_name': 'Фамилия',
            'secret_word': 'Секретное слово'
        }
        help_texts = {
            'username': 'a-z | A-Z | 0-0 | _ | - | 3+ символа',
            'first_name': 'а-я | А-Я',
            'last_name': 'а-я | А-Я',
            'secret_word': 'а-я | 6+ символов'
        }

    password1 = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        help_text=mark_safe(
            '<p>Пароль не должен быть слишком похож на другую вашу личную информацию.</p>'
            '<p>Ваш пароль должен содержать как минимум 8 символов.</p>'
            '<p>Пароль не должен быть слишком простым и распространенным.</p>'
            '<p>Пароль не может состоять только из цифр.</p>'
        )
    )


class UserPasswordResetForm(forms.Form):
    username = forms.CharField(max_length=30, label='Логин')
    secret_word = forms.CharField(max_length=30, label='Секретное слово', widget=forms.PasswordInput())

    def clean(self):
        user_model = get_user_model()
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        secret_word = cleaned_data.get('secret_word')
        try:
            user = user_model.objects.get(username=username)
        except user_model.DoesNotExist:
            raise forms.ValidationError('Такой пары не существует!')
        if not user.check_secret_word(secret_word):
            raise forms.ValidationError('Такой пары не существует!')


class UserPasswordChangeForm(forms.Form):
    password_1 = forms.CharField(widget=forms.PasswordInput(), label='Пароль')
    password_2 = forms.CharField(widget=forms.PasswordInput(), label='Ещё раз')

    def clean(self):
        cleaned_data = super().clean()
        password_1 = cleaned_data.get('password_1')
        password_2 = cleaned_data.get('password_2')
        if password_1 != password_2:
            raise forms.ValidationError('Пароли не совпадают!')
        validate_password(password_1)
