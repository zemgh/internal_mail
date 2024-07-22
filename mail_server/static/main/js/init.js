function init(ws_url) {
    window.ConnectionManager = new ConnectionManagerClass(ws_url)
    window.MailsManager = new MailsManagerClass();
}
