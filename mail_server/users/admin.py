from django.contrib import admin
from django.contrib.auth import get_user_model

from users.models import UserResetToken

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fields = ['username', 'first_name', 'last_name', 'password', 'secret_word']


@admin.register(UserResetToken)
class UserResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'uuid', 'created', 'session_key']
