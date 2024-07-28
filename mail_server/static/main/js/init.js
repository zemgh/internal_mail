function init(ws_url) {
    window.MAILS_PER_PAGE = 18;

    window.CONNECTION = new ConnectionManager(ws_url)
    window.MAILS_MANAGER = new MailsManager();
}