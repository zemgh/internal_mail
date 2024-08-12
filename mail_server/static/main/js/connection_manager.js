class ConnectionManager {
    constructor(ws_url) {
        this.websocket = new WebSocket(ws_url);

        this.websocket.onopen = () => {
            this.#printlog('Connected.')
            this.get_init_data();
        }

        this.websocket.onmessage = () => {
            let message = JSON.parse(event.data);
            this.#printlog('Received data: ', {message})

            switch (message.type) {
                case 'get_mails':
                    MAILS_MANAGER.update_blocks(message);

                    if (message.command)
                        MAILS_MANAGER.handle_command(message.command);
                    if (message.demo)
                        MAILS_MANAGER.activate_demo_mod();

                    break;

                case 'get_contacts':
                    CONTACTS_MANAGER.create_users_list(message.contacts);
                    if (message.add) {
                        CONTACTS_MANAGER.clear_input();
                        CONTACTS_MANAGER.wait = false;
                    }
                    break;

                case 'command': MAILS_MANAGER.handle_command(message); break

                case 'error': MAILS_MANAGER.raise_alert_error(message['error']); break;
            }
        }
    }


    get_init_data() {
        let request = {
            'type': 'init',
            'mails_per_page': window.MAILS_PER_PAGE
        }
        this.send(request);
    }


    send(data) {
        let json_data = JSON.stringify(data);
        this.#printlog('Sent data: ', json_data)
        this.websocket.send(json_data);
    }


    #printlog(text, data=null) {
        if (data)
            console.log(`[${this.#get_date()}] ${text}`, data);
        else
            console.log(`[${this.#get_date()}] ${text}`)
    }

    #get_date() {
        let dt = new Date;
        return `${dt.getDate()}-${dt.getMonth()}-${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`
    }
}