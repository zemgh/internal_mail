from django.contrib.auth import get_user_model
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy, reverse
from django.views.generic import FormView, CreateView

from users.forms import UserLoginForm, UserRegisterForm, UserPasswordResetForm, UserPasswordChangeForm
from users.models import UserResetToken

User = get_user_model()


class UserLoginView(LoginView):
    template_name = 'users/login.html'
    form_class = UserLoginForm
    extra_context = {'title': 'Вход'}


class UserRegistrationView(CreateView):
    template_name = 'users/register.html'
    form_class = UserRegisterForm
    success_url = reverse_lazy('login')
    extra_context = {'title': 'Регистрация', 'register': True}


class UserPasswordResetView(FormView):
    template_name = 'users/password_reset.html'
    form_class = UserPasswordResetForm
    success_url = reverse_lazy('password_change')
    extra_context = {'title': 'Сброс пароля'}

    def form_valid(self, form):
        username = form.cleaned_data.get('username')
        session_key = self.request.session.__dict__.get('_SessionBase__session_key')
        reset_token = self.get_token(username, session_key)
        self.request.session['reset_token'] = str(reset_token.uuid)
        return super().form_valid(form)


    @staticmethod
    def get_token(username: str, session_key: str) -> UserResetToken:
        user = User.objects.get(username=username)
        try:
            token = UserResetToken.objects.get(user=user)
            token.delete()
        except UserResetToken.DoesNotExist:
            pass
        return UserResetToken.objects.create(user=user, session_key=session_key)



class UserPasswordChangeView(FormView):
    template_name = 'users/password_change.html'
    form_class = UserPasswordChangeForm
    success_url = reverse_lazy('login')
    extra_context = {'title': 'Новый пароль'}

    def get(self, request, *args, **kwargs):
        self.extra_context['reset_token'] = request.session.get('reset_token')
        return super().get(request, *args, **kwargs)

    def form_valid(self, form):
        token_uuid = self.request.POST.get('reset_token')
        try:
            token = UserResetToken.objects.get(uuid=token_uuid)
        except UserResetToken.DoesNotExist:
            form.add_error(None, f'Токен не найден. Повторите процедуру <a href="{reverse('password_reset')}">сброса пароля</a>')
            return self.form_invalid(form)

        if not token.session_key == self.request.session.__dict__.get('_SessionBase__session_key'):
            form.add_error(None, f'Неверная сессия. Повторите процедуру <a href="{reverse('password_reset')}">сброса пароля</a>')
            return self.form_invalid(form)

        if not token.is_active:
            form.add_error(None, f'Токен устарел. Повторите процедуру <a href="{reverse('password_reset')}">сброса пароля</a>')
            return self.form_invalid(form)

        user = token.user
        user.set_password(form.cleaned_data.get('password_1'))
        user.save()
        token.delete()
        return super().form_valid(form)





