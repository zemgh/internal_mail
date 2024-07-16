from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import reverse
from django.views.generic import TemplateView


class MainView(LoginRequiredMixin, TemplateView):
    template_name = 'main/main.html'
    host = '127.0.0.1:8000'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = self.request.user
        context['ws_url'] = 'ws://' + self.host + reverse('main')
        return context