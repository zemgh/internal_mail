from django.urls import path

from main import consumers


websocket_urlpatterns = [
    path('', consumers.MainConsumer.as_asgi())
]
