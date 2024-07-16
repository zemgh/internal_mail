from django.urls import path

from main import consumers

websocket_urlpatterns = [
    path('', consumers.TestConsumer.as_asgi())
]
