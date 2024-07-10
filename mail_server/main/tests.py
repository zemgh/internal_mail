from django.test import TestCase, SimpleTestCase
from django.urls import reverse
from http import HTTPStatus


class GetPagesTestCase(SimpleTestCase):
    def test_main_page(self):
        main_page = reverse('index')
        response = self.client.get(main_page)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        # self.assertTemplateUsed(response, 'main/main_page.html')