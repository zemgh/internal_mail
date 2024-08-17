function init(ws_url) {
    window.MAILS_PER_PAGE = 18;
    window.demo_mod = false;

    window.CONNECTION_MANAGER = new ConnectionManager();
    window.MENU_MANAGER = new MenuManager();
    window.MAILS_MANAGER = new MailsManager();
    window.CONTACTS_MANAGER = new ContactsManager();
}