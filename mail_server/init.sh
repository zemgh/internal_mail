#!/bin/bash

python manage.py migrate
sleep 5
python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.create_superuser(username='admin', password='admin')"
echo "server ready"

