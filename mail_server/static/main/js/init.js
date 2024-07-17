function init(ws_url) {
    window.ws_connection = new WebSocket(ws_url)
    ws_connection.onopen = (event) => {
        console.log('connected');
        create_html_blanks();
        window.current_page = null;
        let data = {'type': 'get_mails'};
        send_data(data)
    }
}
