#!/bin/bash

echo "Enter admin and service password: "
read -s password

python manage.py migrate
echo "Migrates completed."

python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.create_superuser(username='admin', password='$password')"
python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.create_superuser(username='service', password='$password')"

echo "Server ready."

