from django.contrib import admin

from main.models import Mail, DraftMail, DelayedMail


@admin.register(Mail)
class MailAdmin(admin.ModelAdmin):
    list_display = ['sender', 'created']


@admin.register(DraftMail)
class DraftMailAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'created']


@admin.register(DelayedMail)
class DelayedMailAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'created', 'send_datetime']