# Generated by Django 5.0.7 on 2024-07-10 17:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='secret_word',
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
