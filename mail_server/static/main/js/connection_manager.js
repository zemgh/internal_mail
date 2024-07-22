function ConnectionManagerClass (ws_url) {
    this.websocket = new WebSocket(ws_url);

    this.websocket.onopen = (event) => {
        console.log('connected');
        this.get_init_data()
    }

    this.websocket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log('incoming message:', message)
        switch (message.type) {
            case 'get_mails':
                MailsManager.update_blocks(message);
                break;
        }
    }


    this.get_init_data = function() {
        let request = {'type': 'get_mails'};
        this.send(request);
    }

    this.send = function(data) {
        let json_data = this.to_json(data);
        console.log('send message: ', json_data)
        this.websocket.send(json_data);
    }

    this.to_json = function(data) {
        return JSON.stringify(data)
    }

}