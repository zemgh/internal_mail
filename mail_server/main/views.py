from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class MainView(LoginRequiredMixin, TemplateView):
    template_name = 'main/main.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['title'] = self.request.user
        return context