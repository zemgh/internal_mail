window.MessagesHandler = {
    get: get_mails,
}


ws_connection.onmessage = (event) => {
    let message = JSON.parse(event.data);
    switch (message.type) {
        case 'get_mails': MessagesHandler.get(message); break;
        }
}


function get_mails(message) {
    MailManager.mails.update(message.received, message.sent, message.deleted);
    if (window.current_page === 'received')
        MailManager.received();
    else if (window.current_page === 'sent')
        MailManager.sent();
    else if (window.current_page === 'deleted')
        MailManager.deleted();
}


