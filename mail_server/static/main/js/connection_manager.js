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
                    MAILS_MANAGER.update_blocks(message);
                    if (message.command)
                        MAILS_MANAGER.handle_command(message.command);
                    break;

                case 'get_contacts':
                    CONTACTS_MANAGER.create_users_list(message.contacts);
                    if (message.add)
                        CONTACTS_MANAGER.clear_input();
                    break;

                case 'command': MAILS_MANAGER.handle_command(message.command); break

                case 'error': MAILS_MANAGER.raise_alert_error(message['error']); break;
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