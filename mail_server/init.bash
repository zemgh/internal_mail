#!/bin/bash

python manage.py migrate
printf "\nMigrates completed.\n"

printf  "\nEnter admin and service password:\n"
read -s password

python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.create_superuser(username='admin', password='$password')"
python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.create_superuser(username='service', password='$password')"

printf "\nServer ready.\n\n"

