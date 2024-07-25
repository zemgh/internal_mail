function init(ws_url) {
    window.CONNECTION = new ConnectionManager(ws_url)
    window.MAILS_MANAGER = new MailsManager();
}
