ws_connection.onmessage = (event) => {
    let message = JSON.parse(event.data);
    console.log(message)
    switch (message.action) {
        case 'send_mail_list': {
            window.mail_list = message.mail_list;
            let current_page = 'received_mails';
            create_mails_block(mail_list);
        }
    }
}
