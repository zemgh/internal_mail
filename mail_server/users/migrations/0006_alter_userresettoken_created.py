# Generated by Django 5.0.7 on 2024-07-11 23:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_remove_userresettoken_expires_userresettoken_created_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userresettoken',
            name='created',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
