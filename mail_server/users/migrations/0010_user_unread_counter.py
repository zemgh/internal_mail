# Generated by Django 5.0.7 on 2024-07-17 15:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_alter_user_first_name_alter_user_last_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='unread_counter',
            field=models.IntegerField(default=0),
        ),
    ]
