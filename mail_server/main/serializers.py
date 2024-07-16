import json


class MailSerializer:

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
            'receivers': cls.get_receivers(mail.receivers.all()),
            'subject': mail.subject,
            'message': mail.message,
            'created': mail.get_datetime
        }
        return m_data

    @staticmethod
    def get_receivers(receivers):
        return [user.username for user in receivers]
