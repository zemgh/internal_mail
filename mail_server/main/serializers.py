from rest_framework import serializers

from main.models import Mail


class ConsumerMailSerializer:
    @classmethod
    def get_data_for_json(cls, queryset):
        mails_data = []
        for m in queryset:
            m_data = cls.get_mail_data(mail=m)
            mails_data.append(m_data)
        return mails_data

    @classmethod
    def get_mail_data(cls, mail):
        m_data = {
            'id': str(mail.id),
            'sender': mail.sender.username,
            'receiver': mail.receiver.username,
            'subject': mail.subject,
            'message': mail.message,
            'created': mail.get_datetime,
            'read': mail.read
        }
        return m_data


class ConsumerDraftSerializer:
    @classmethod
    def get_data_for_json(cls, queryset):
        drafts_data = []
        for d in queryset:
            d_data = cls.get_draft_data(draft=d)
            drafts_data.append(d_data)
        return drafts_data

    @classmethod
    def get_draft_data(cls, draft):
        d_data = {
            'id': str(draft.id),
            'sender': draft.sender.username,
            'receiver': draft.receiver,
            'subject': draft.subject,
            'message': draft.message,
            'created': draft.get_datetime,
        }
        return d_data


class MailListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mail
        fields = ['id', 'subject', 'sender', 'read', 'get_api_datetime']


class MailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mail
        fields = ['id', 'subject', 'message', 'sender', 'get_api_datetime', 'read']


class DelayedMailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mail
        fields = ['id', 'subject', 'message', 'sender', 'send_datetime']