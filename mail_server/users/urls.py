from django.urls import path

from users import views

urlpatterns = [
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('password_reset', views.UserPasswordResetView.as_view(), name='password_reset'),
    path('password_change', views.UserPasswordChangeView.as_view(), name='password_change'),
    path('demo/', views.DemoActivationView.as_view(), name='demo'),
    path('logout/', views.user_logout, name='logout')
]