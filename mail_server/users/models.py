import hashlib
import string
import uuid

from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.core.exceptions import ValidationError
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


class UserValidators:
    cyrillic_chars = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    latin_chars = string.ascii_letters
    digits = string.digits

    @classmethod
    def validate_username(cls, username):
        allowed_chars = set(cls.latin_chars + cls.digits + '-_')
        if not set(username).issubset(allowed_chars):
            raise ValidationError("Ник должен состоять из латинских букв(оба регистра), цифр и символов '-', '_'.")
        if not len(username) >= 3:
            raise ValidationError("Длинна ника должна быть 3 и выше.")
        return username

    @classmethod
    def validate_names(cls, name):
        allowed_chars = set(cls.cyrillic_chars + cls.cyrillic_chars.upper())
        if not set(name).issubset(allowed_chars):
            raise ValidationError("Имя/Фамилия должны содержать только буквы русского алфавита.")
        return name.lower().capitalize()

    @classmethod
    def validate_secret_word(cls, secret_word):
        allowed_chars = set(cls.cyrillic_chars)
        if not len(secret_word) >= 6:
            raise ValidationError("Длина секретного слова должна быть 6 и более символов.")
        if not set(secret_word).issubset(allowed_chars):
            raise ValidationError("Слово должно состоять из строчных букв русского алфавита.")
        return secret_word


class User(AbstractBaseUser):
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_demo = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    username = models.CharField(max_length=30, unique=True, db_index=True, verbose_name='Логин',
                                error_messages={'unique': 'Пользователья с таким ником уже существует.'},
                                validators=[UserValidators.validate_username])
    first_name = models.CharField(max_length=30, validators=[UserValidators.validate_names])
    last_name = models.CharField(max_length=30, validators=[UserValidators.validate_names])
    secret_word = models.CharField(max_length=64, validators=[UserValidators.validate_secret_word])

    contacts = models.ManyToManyField('User')
    channel = models.CharField(max_length=100, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f'{self.last_name} {self.first_name}'


    @property
    def is_online(self):
        if self.channel:
            return True
        return False

    @staticmethod
    def __hash_secret_word(secret_word: str) -> str:
        data = secret_word.encode()
        sw_hash = hashlib.new('sha256', data).hexdigest()
        return sw_hash

    def check_secret_word(self, secret_word: str) -> bool:
        sw_hash = self.__hash_secret_word(secret_word)
        return sw_hash == self.secret_word

    def save(self, *args, **kwargs):
        if not self.pk:
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
