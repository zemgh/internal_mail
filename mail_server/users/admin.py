from django.contrib import admin
from django.contrib.auth import get_user_model

from users.models import UserResetToken

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fields = ['username', 'first_name', 'last_name', 'channel', 'is_demo', 'is_active']
    list_display = ['username', 'first_name', 'last_name', 'is_online']

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        return super().save_model(request, obj, form, change)


@admin.register(UserResetToken)
class UserResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'uuid', 'created', 'session_key']
