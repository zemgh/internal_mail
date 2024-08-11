# Generated by Django 5.0.7 on 2024-08-10 21:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_remove_mail_receivers_mail_receiver'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='delayedmail',
            name='receivers',
        ),
        migrations.RemoveField(
            model_name='draftmail',
            name='receivers',
        ),
        migrations.AddField(
            model_name='delayedmail',
            name='receiver',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='draftmail',
            name='receiver',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
