function init(ws_url) {
    window.ws_connection = new WebSocket(ws_url)
    ws_connection.onopen = (event) => {
        console.log('connected');
        window.mails_list = received_mails;
        window.mail = null;
        let data = {'type': 'get_mails'};
        send_data(data)
    }
}
