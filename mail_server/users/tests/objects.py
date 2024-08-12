from django.contrib.auth import get_user_model


class TestUser:
    model = get_user_model()
    username = 'test_user_name'
    first_name = 'Петя'
    last_name = 'Петечкин'
    secret_word = 'секрет'
    password = 'test_password_123'
    counter = 0

    @classmethod
    def create_test_user(cls, multiple=False):
        def create_multiple_users_name():
            username = f'{cls.username}-{cls.counter}'
            cls.counter += 1
            return username

        user = cls.model.objects.create(
            username=cls.username if not multiple else create_multiple_users_name(),
            first_name=cls.first_name,
            last_name=cls.last_name,
            secret_word=cls.secret_word,
            password=cls.password
        )

        return user