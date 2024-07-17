const mails = document.querySelector('.mails')
function create_mails_block(m_list) {
    clear_mails()
    let mails_block = create_div_mails_block(m_list);
    mails.appendChild(mails_block);
}

function clear_mails_block() {
    let mails_block = document.querySelector('.mails_block');
    mails.removeChild(mails_block);
}

function get_received_mails() {
    create_mails_block(window.mail_list);
}

function get_deleted_mails() {
    create_mails_block(window.deleted_mail_list);
}

function show_mail(mail) {
    let mail_div = create_div_mails_mail(mail.id, mail);
    mails.appendChild(mail_div);
}

function clear_mails() {
    let mail_block = document.querySelector('.mails_block');
    if (mail_block) mails.removeChild(mail_block);
    else {
        let mails_mail = document.querySelector('.mails_mail');
        if (mails_mail) mails.removeChild(mails_mail);
        else {
            let mail_form = document.querySelector('.mails_new_mail_form');
            if (mail_form) mails.removeChild(mail_form)
        }
    }
}

function create_mail() {
    clear_mails();
    let form = create_form_mails_new_mail_form();
    mails.appendChild(form);

    function add_new_mail_options(div) {
    }
}

function send_mail(receivers, subject, message) {
    let data = {
        'type': 'create_mail',
        'receivers': receivers,
        'subject': subject,
        'message': message
    }
    send_data(data)

}

function delete_mails(mails_lst) {
    let data = {'type':'delete_mails', 'mails_list': mails_lst}
    console.log(data)
    send_data(data)
}

function send_data(data) {
    window.ws_connection.send(JSON.stringify(data))
}
