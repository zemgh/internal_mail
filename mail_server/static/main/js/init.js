function init(ws_url) {
    window.ws_connection = new WebSocket(ws_url)
    ws_connection.onopen = (event) => {
        console.log('connected');

        window.current_page = 'received';
        window.previous_page = null;
        window.current_mail = null;
        window.mails_selected = []

        window.mails_list = [];
        window.sent_mails_list = [];
        window.deleted_mails_list = [];

        window.mails_block = null;
        window.sent_mails_block = null;
        window.deleted_mails_block = null;

        let data = {'type': 'get_mails'};
        send_data(data)
    }
}
