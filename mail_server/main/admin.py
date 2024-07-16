from django.contrib import admin

from main.models import Mail


@admin.register(Mail)
class MailAdmin(admin.ModelAdmin):

    exclude = ['deferred_datetime']
    list_display = ['sender', 'created']
