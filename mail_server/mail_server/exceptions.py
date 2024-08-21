from rest_framework.exceptions import APIException


class BaseCustomException(APIException):
    status_code = 400

    def __init__(self, message=None):
        self.detail = message


class ObjectAccessDeniedException(BaseCustomException):
    pass


class BadParametersException(BaseCustomException):
    pass


class ListTypeException(BaseCustomException):
    pass


class WrongFieldsException(BaseCustomException):
    pass