ws_connection.onmessage = (event) => {
    let message = JSON.parse(event.data);
    switch (message.type) {
        case 'get_mails': {
            window.mail_list = message.mails_list;
            window.deleted_mail_list = message.deleted_mails_list;
            get_received_mails();
        }
    }
}
