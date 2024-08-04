function init(ws_url) {
    window.MAILS_PER_PAGE = 18;

    window.CONNECTION_MANAGER = new ConnectionManager(ws_url);
    window.MAILS_MANAGER = new MailsManager();
    window.CONTACTS_MANAGER = new ContactsManager();
}