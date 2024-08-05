# Generated by Django 5.0.7 on 2024-08-05 17:21

import django.db.models.deletion
import main.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mail',
            name='deferred',
        ),
        migrations.RemoveField(
            model_name='mail',
            name='deferred_datetime',
        ),
        migrations.CreateModel(
            name='DelayedMail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subject', models.CharField(max_length=50)),
                ('message', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('send_datetime', models.DateTimeField()),
                ('answer_for', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='main.mail')),
                ('receivers', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='delayed_mails', to=settings.AUTH_USER_MODEL)),
            ],
            bases=(models.Model, main.models.BaseMailsModel),
        ),
    ]
