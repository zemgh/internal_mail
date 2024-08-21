from django.urls import path, include
from api.views import MailListAPI, MailAPI, CreateMailAPI

app_name = 'api'

urlpatterns = [
    path('mails/', MailListAPI.as_view()),

    path('mail/<int:pk>/', MailAPI.as_view()),
    path('mail/create/', CreateMailAPI.as_view()),

    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken'))
]
