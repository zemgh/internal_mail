const mails = document.querySelector('.mails')
function create_mails_block() {

    let mails_block = create_div('mails_block');
    mails.appendChild(mails_block);

    for (let m of mail_list) {
        let line = create_div( 'mails_line', undefined, `mail-${m.id}`);
        line.addEventListener('click', (event) => {
            clear_mails_block();
            show_mail(m);
        })
        mails_block.appendChild(line);

        let checkbox = create_input('checkbox', undefined, `checkbox-${m.id}`);
        let sender = create_div('mails_line_sender', m.sender, `sender-${m.id}`);
        let subject = create_div('mails_line_subject', m.subject, `subject-${m.id}`);
        let created = create_div('mails_line_datetime', m.created.short, `created-${m.id}`);

        [checkbox, sender, subject, created].forEach(el => line.appendChild(el));
    }
}

function clear_mails_block() {
    let mails_block = document.querySelector('.mails_block');
    mails.removeChild(mails_block);
}

function show_mail(mail) {
    let mail_div = create_div('mails_mail', undefined, mail.id);
    mails.appendChild(mail_div);

    let options = create_div('mails_mail_options');
    add_mail_options(options);

    let info = create_div('mails_mail_info');
    info.innerHTML = `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`;

    let message = create_div('mails_mail_message', mail.message);

    [options, info, message].forEach(el => mail_div.appendChild(el));

    function add_mail_options(div) {
        let back = create_options_button(div, 'Назад');
        back.addEventListener('click', (event) => {
            clear_mail();
            create_mails_block();
        })

        let reply = create_options_button(div, 'Ответить');
        reply.addEventListener('click', (event) => {

        })

        let del = create_options_button(div, 'Удалить');
        del.addEventListener('click', (event) => {
            clear_mail();
            let data = [mail_div.id];
            delete_mails(data);
        })

        function create_options_button(parent, text) {
            let button = create_div('mails_mail_options_button');
            button.innerText = text;
            parent.appendChild(button);
            return button;
        }
    }
}

function clear_mail() {
    let mail = document.querySelector('.mails_mail');
    mails.removeChild(mail);
}

function clear_mail_block () {
    let mail_block = document.querySelector('.mails_block');
    mails.removeChild(mail_block);
}

function create_mail() {
    clear_mail_block();

    let form = document.createElement('form');
    form.className = 'mails_new_mail_form';
    mails.appendChild(form);

    let receivers = create_input('text', 'receivers', undefined, 'mails_new_mail_receivers');
    let subject = create_input('text', 'subject', undefined, 'mails_new_mail_subject');
    let message = create_input('textarea', 'message', undefined, 'mails_new_mail_subject');

    [receivers, subject, message].forEach(el => form.appendChild(el));

}

function delete_mails(mails_lst) {
    let data = {'delete_mails': mails_lst}
    data = JSON.stringify(data)
    ws_connection.send(data)
}