# Generated by Django 5.0.7 on 2024-08-13 14:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_delayedmail_message_delayedmail_subject_mail_message_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='delayedmail',
            options={'ordering': ['-created']},
        ),
    ]
