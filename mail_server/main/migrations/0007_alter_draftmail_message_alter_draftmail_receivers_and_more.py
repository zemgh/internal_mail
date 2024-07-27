# Generated by Django 5.0.7 on 2024-07-26 20:27

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_draftmail'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='draftmail',
            name='message',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='draftmail',
            name='receivers',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='draftmail',
            name='subject',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
