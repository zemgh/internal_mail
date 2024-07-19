const MAILS = document.querySelector('.mails');

window.MailManager = {
    received: get_received_mails,
    deleted: get_deleted_mails,
    sent: get_sent_mails,
    open: show_mail,
    create: create_mail
}
window.MailManager.handler = {
    send: send_mail,
    delete: delete_mails,
    update: update_mails_and_mails_blocks
}


function get_received_mails() {
    //      Меню - Входящие
    window.current_page = 'received';
    if (window.mails_block == null)
        window.mails_block = create_mails_block(window.mails_list);
    show_mails_block(window.mails_block)
}


function get_sent_mails() {
    //      Меню - Исходящие
    window.current_page = 'sent';
    if (window.sent_mails_block == null)
        window.mails_block = create_mails_block(window.sent_mails_list, true);
    show_mails_block(window.sent_mails_block)
}


function get_deleted_mails() {
    //      Меню - Удалённые
    window.current_page = 'deleted';
    if (window.deleted_mails_block == null)
        window.deleted_mails_block = create_mails_block(window.deleted_mails_list);
    show_mails_block(window.deleted_mails_block)
}


function show_mail(mail, sent=false) {
    //      Показать письмо
    window.current_mail = mail;
    if (window.current_page !== 'mail') {
        window.previous_page = window.current_page;
        window.current_page = 'mail';
    }
    clear_mails();

    let mail_block = ElementsManager.samples.mail.cloneNode(true);
    let options_block = mail_block.querySelector('#m_options');
    let info = mail_block.querySelector('#m_info');
    let message = mail_block.querySelector('#m_message');
    info.innerHTML = `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`;
    message.innerText = mail.message;

    let back = options_block.querySelector('#back');
    back.addEventListener('click', (event) => {
        go_back()
    })

    if (!sent) {

        let reply = options_block.querySelector('#reply');
        reply.addEventListener('click', (event) => {
            MailManager.create(true, mail);
        })

        let del = options_block.querySelector('#del');
        del.addEventListener('click', (event) =>
            MailManager.handler.delete([mail.id])
        )
    }

    MAILS.appendChild(mail_block)
}


function create_mail(reply=false, mail=undefined) {
    //      Создать письмо
    if (window.current_page !== 'mail') {
        window.previous_page = window.current_page;
        window.current_page = 'mail';
        }
    clear_mails();

    let form = ElementsManager.samples.new_mail.cloneNode(true);
    if (reply)
        add_reply_attrs();
    let options_block = form.querySelector('#m_options');

    let back = options_block.querySelector('#back');
    back.addEventListener('click', (event) => {
        if (reply)
            MailManager.open(window.current_mail);
        else go_back();
    })

    let send = options_block.querySelector('#send');
    send.addEventListener('click', (event) => {
        let receivers = form.querySelector('#receivers').value;
        let subject = form.querySelector('#subject').value;
        let message = form.querySelector('#message').value;
        MailManager.handler.send([receivers], subject, message, reply);
    })

    MAILS.appendChild(form);

    function add_reply_attrs() {
        form.querySelector('#receivers').value = mail.receivers;
        form.querySelector('#subject').value = `Re: ${mail.subject}`;
        form.querySelector('#message').value =
            '\n\n' +
            '*'.repeat(20) +
            `\n\n${mail.created.long}` +
            `\nОт ${mail.sender}` +
            `\n\n${mail.message}`
    }
}


function create_mails_block(m_list, sent=false) {
    //      Создать блок писем
    let mails_block = ElementsManager.samples.mails_block.cloneNode(true);
    mails_block.id = `mails_block`;
    add_mails_to_block(m_list, mails_block);
    return mails_block;
    function add_mails_to_block (m_list, block) {
        for (let m of m_list) {
            let line = ElementsManager.samples.mails_line.cloneNode(true);
            let checkbox =  line.querySelector('#checkbox');
            let sender = line.querySelector('#sender');
            let subject = line.querySelector('#subject');
            let datetime = line.querySelector('#datetime');

            if (sent)
                sender.innerText = m.receivers;
            else
                sender.innerText = m.sender;
            subject.innerText = m.subject;
            datetime.innerText = m.created.short;

            line.addEventListener('click', (event) => {
                MailManager.open(m, true)
            })

            block.appendChild(line);
        }
    }
}


function clear_mails() {
    //      Очистка окна MAILS
    let mails_block = document.querySelector('#mails_block');
    if (mails_block)
        MAILS.removeChild(mails_block);

    else {
        let mail = document.querySelector('#mail');
        if (mail)
            MAILS.removeChild(mail);

        else {
            let new_mail = document.querySelector('#nm_form');
            if (new_mail)
                MAILS.removeChild(new_mail);
        }
    }
}


function show_mails_block(block) {
    //      Показать блок писем
    clear_mails();
    MAILS.appendChild(block);
}


function update_mails_and_mails_blocks(received, sent, deleted) {
    if (received !== window.mails_list) {
        window.mails_list = received;
        window.mails_block = create_mails_block(received);
    }

    if (sent !== window.sent_mails_list) {
        window.sent_mails_list = sent;
        window.sent_mails_block = create_mails_block(sent, true);
    }

    if (deleted !== window.deleted_mails_list) {
        window.deleted_mails_list = deleted;
        window.deleted_mails_block = create_mails_block(deleted);
    }
}


function send_mail(receivers, subject, message, reply=false) {
    //      Отправить письмо
    let data = {
        'type': 'create_mail',
        'receivers': receivers,
        'subject': subject,
        'message': message
    }
    send_data(data);
    if (reply)
        MailManager.open(window.current_mail);
    else go_back()
}


function delete_mails(mails_lst) {
    //      Удалить письма
    let data = {'type':'delete_mails', 'mails_list': mails_lst};
    send_data(data);
    go_back();
}


function send_data(data) {
    window.ws_connection.send(JSON.stringify(data))
}


function go_back() {
    if (window.window.previous_page === 'received')
        return MailManager.received();
    else if (window.window.previous_page === 'sent')
        return MailManager.sent();
    else if (window.window.previous_page === 'deleted')
        return MailManager.deleted();
}


function create_test_mail() {
    let data = {
        'type': 'create_test_mail',
    }
    send_data(data);
}