import hashlib
import uuid

from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):

    def create_user(self, username, password=None, **extra_fields):
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        user = self.create_user(username, password, **extra_fields)
        user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    username = models.CharField(max_length=30, unique=True, db_index=True, verbose_name='Логин')
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    secret_word = models.CharField(max_length=64)

    STATUS_CHOICES = (
        (0, 'offline'),
        (1, 'online')
    )
    status = models.BooleanField(choices=STATUS_CHOICES, default=0)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f'{self.last_name} {self.first_name}'

    @staticmethod
    def __hash_secret_word(secret_word: str) -> str:
        data = secret_word.encode()
        sw_hash = hashlib.new('sha256', data).hexdigest()
        return sw_hash

    def check_secret_word(self, secret_word: str) -> bool:
        sw_hash = self.__hash_secret_word(secret_word)
        return sw_hash == self.secret_word

    def save(self, *args, **kwargs):
        if not self.pk and self.secret_word:
            self.secret_word = self.__hash_secret_word(self.secret_word)
        super().save(*args, **kwargs)

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True


class UserResetToken(models.Model):
    user = models.OneToOneField(to=get_user_model(), on_delete=models.CASCADE, related_name='reset_token')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    created = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=32)

    objects = models.Manager()

    token_lifetime = 600

    def is_active(self):
        return self.created + timezone.timedelta(seconds=self.token_lifetime) > timezone.now()

