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
                    break;
            }
        }
    }


    get_init_data() {
        let request = {'type': 'get_mails'};
        this.send(request);
    }


    send(data) {
        let json_data = JSON.stringify(data);
        console.log('send message: ', json_data)
        this.websocket.send(json_data);
    }


}