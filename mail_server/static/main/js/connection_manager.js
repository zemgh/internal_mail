class ConnectionManager {
    constructor(ws_url) {
        this.websocket = new WebSocket(ws_url);

        this.websocket.onopen = () => {
            console.log('connected');
            this.get_init_data();
        }

        this.websocket.onmessage = () => {
            let message = JSON.parse(event.data);
            console.log('incoming message:', message);

            switch (message.type) {
                case 'get_mails':
                        if (message.close_create_form)
                            MAILS_MANAGER.current_block.close_create_mail_form();
                        MAILS_MANAGER.update_blocks(message);
                        break;
                case 'error':
                        MAILS_MANAGER.raise_alert_error(message['error'])
            }
        }
    }


    get_init_data() {
        let request = {
            'type': 'init',
            'mails_per_page': window.MAILS_PER_PAGE
        };
        this.send(request);
    }


    send(data) {
        let json_data = JSON.stringify(data);
        console.log('send message: ', json_data)
        this.websocket.send(json_data);
    }


}