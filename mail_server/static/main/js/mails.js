const MAILS = document.querySelector('.mails');

window.MailManager = {
    received: get_received_mails,
    deleted: get_deleted_mails,
    open: show_mail,
    create: create_mail,
    send: send_mail,
    delete: delete_mails
}


function get_received_mails() {
    window.mails_list = get_received_mails;
    show_mails(window.mail_list);
}


function get_deleted_mails() {
    window.mails_list = get_deleted_mails;
    show_mails(window.deleted_mail_list);
}


function send_mail(receivers, subject, message) {
    let data = {
        'type': 'create_mail',
        'receivers': receivers,
        'subject': subject,
        'message': message
    }
    send_data(data);
    window.mails_list();
}


function delete_mails(mails_lst) {
    let data = {'type':'delete_mails', 'mails_list': mails_lst};
    send_data(data);
    window.mails_list();
}


function send_data(data) {
    window.ws_connection.send(JSON.stringify(data))
}


function clear_mails() {
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


function show_mail(mail) {
    clear_mails();
    let mail_block = ElementsManager.samples.mail.cloneNode(true);
    let options_block = mail_block.querySelector('#m_options');
    let info = mail_block.querySelector('#m_info');
    let message = mail_block.querySelector('#m_message');
    info.innerHTML = `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`;
    message.innerText = mail.message;

    let back = options_block.querySelector('#back');
    back.addEventListener('click', (event) => {
        if (window.mails_list)
            window.mails_list();
    })

    let reply = options_block.querySelector('#reply');
    reply.addEventListener('click', (event) => {
        window.mail = mail;
        MailManager.create();
    })

    let del = options_block.querySelector('#del');
    del.addEventListener('click', (event) =>
        MailManager.delete([mail.id])
    );

    MAILS.appendChild(mail_block)
}

function show_mails(m_list) {
    clear_mails();
    if (m_list) {
        let mails_block = ElementsManager.samples.mails_block.cloneNode(true);
        add_mails_to_block(m_list, mails_block);
        MAILS.appendChild(mails_block);
    }
    function add_mails_to_block (m_list, block) {
        for (let m of m_list) {
            let line = ElementsManager.samples.mails_line.cloneNode(true);
            let sender = line.querySelector('#sender');
            let subject = line.querySelector('#subject');
            let datetime = line.querySelector('#datetime');
            sender.innerText = m.sender;
            subject.innerText = m.subject;
            datetime.innerText = m.created.short;
            line.addEventListener('click', (event) =>
                MailManager.open(m)
            );
            block.appendChild(line);
        }
    }
}


function create_mail() {
    clear_mails();
    let form = ElementsManager.samples.new_mail.cloneNode(true);
    let options_block = form.querySelector('#m_options');

    let back = options_block.querySelector('#back');
    back.addEventListener('click', (event) => {
        if (window.mail)
            MailManager.open(window.mail);
    })

    let send = options_block.querySelector('#send');
    send.addEventListener('click', (event) => {
        let receivers = form.querySelector('#receivers').value;
        let subject = form.querySelector('#subject').value;
        let message = form.querySelector('#message').value;
        MailManager.send([receivers], subject, message);
    })

    MAILS.appendChild(form);
}
