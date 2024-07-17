function create_html_blanks() {
    window.n_mails_block = create_div_for_blanks('mails_block');
    window.n_mails_line = create_div_for_blanks('mails_line');
    window.n_mail_checkbox = create_input_for_blanks('checkbox', 'mails_line_checkbox');
    window.n_mails_line_sender = create_div_for_blanks('mails_line_sender');
    window.n_mails_line_subject = create_div_for_blanks('mails_line_subject');
    window.n_mails_line_datetime = create_div_for_blanks('mails_line_datetime');
    window.n_mails_mail = create_div_for_blanks('mails_mail');
    window.n_mails_mail_options = create_div_for_blanks('mails_mail_options');
    window.n_mails_mail_info = create_div_for_blanks('mails_mail_info');
    window.n_mails_mail_message = create_div_for_blanks('mails_mail_message');
    window.n_mails_mail_options_button = create_div_for_blanks('mails_mail_options_button');
    window.n_mails_new_mail_form = create_form_for_blanks('mails_new_mail_form');
    window.n_mails_new_mail_receivers = create_input_for_blanks('text', 'mails_new_mail_receivers', 'receivers');
    window.n_mails_new_mail_subject = create_input_for_blanks('text', 'mails_new_mail_subject', 'subject');
    window.n_mails_new_mail_message = create_textarea_for_blanks('mails_new_mail_message', 'message');
    window.n_mails_new_mail_line = create_div_for_blanks('mails_new_mail_line');
    window.n_mails_new_mail_label = create_div_for_blanks('mails_new_mail_label')
}

function create_div_for_blanks(css, text=undefined, id=undefined) {
    let el = document.createElement('div');
    el.className = css
    if (text) el.innerText = text;
    if (id) el.id = id;
    return el;
}

function create_input_for_blanks(type, css=undefined, name=undefined) {
    let el = document.createElement('input');
    el.type = type;
    el.className = css;
    if (name) {
        el.name = name;
        el.id = name;
    }
    return el;
}

function create_form_for_blanks(css) {
    let el = document.createElement('form')
    el.className = css;
    return el;
}

function create_textarea_for_blanks(css, name) {
    let el = document.createElement('textarea')
    el.className = css;
    el.name = name;
    return el;
}

function create_options_button(parent, text) {
    let button = create_div_mails_mail_options_button();
    button.innerText = text;
    parent.appendChild(button);
    return button;
}

function create_div_mails_block(m_list) {
    let div = window.n_mails_block.cloneNode(true);

    for (let m of m_list) {
        let line = create_div_mails_line(`mail-${m.id}`);
        line.addEventListener('click', (event) => {
            clear_mails_block();
            show_mail(m);
        })
        div.appendChild(line);

        let checkbox = create_input_mails_checkbox(`checkbox-${m.id}`);
        let sender = create_div_mails_line_sender(m.sender, `sender-${m.id}`);
        let subject = create_div_mails_line_subject(m.subject, `subject-${m.id}`);
        let created = create_div_mails_line_datetime(m.created.short, `created-${m.id}`);

        [checkbox, sender, subject, created].forEach(el => line.appendChild(el));
    }

    return div
}

function create_div_mails_line(id) {
    let div = window.n_mails_line.cloneNode(true);
    div.id = id;
    return div;
}

function create_input_mails_checkbox(id) {
    let input = window.n_mail_checkbox.cloneNode(true);
    input.id = id;
    return input;
}

function create_div_mails_line_sender(text, id) {
    let div = window.n_mails_line_sender.cloneNode(true);
    div.innerText = text;
    div.id = id;
    return div;
}

function create_div_mails_line_subject(text, id) {
    let div = window.n_mails_line_subject.cloneNode(true);
    div.innerText = text;
    div.id = id;
    return div;
}

function create_div_mails_line_datetime(text, id) {
    let div = window.n_mails_line_datetime.cloneNode(true);
    div.innerText = text;
    div.id = id;
    return div;
}

function create_div_mails_mail(id, mail) {
    let div = window.n_mails_mail.cloneNode(true);
    div.id = id;

    let options = create_div_mails_mail_options();
    add_mail_options(options);

    let info = create_div_mails_mail_info(
        `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`
    );

    let message = create_div_mails_mail_message(mail.message);

    [options, info, message].forEach(el => div.appendChild(el));

    function add_mail_options(div) {
        let back = create_options_button(div, 'Назад');
        back.addEventListener('click', (event) => {
            get_received_mails()
        })

        let reply = create_options_button(div, 'Ответить');
        reply.addEventListener('click', (event) => {
            create_mail()
        })

        let del = create_options_button(div, 'Удалить');
        del.addEventListener('click', (event) => {
            let data = [id];
            delete_mails(data);
            get_received_mails()
        })
    }
    return div;
}

function create_div_mails_mail_options() {
    return window.n_mails_mail_options.cloneNode(true);
}

function create_div_mails_mail_info(html) {
    let div = window.n_mails_mail_info.cloneNode(true);
    div.innerHTML = html;
    return div;
}

function create_div_mails_mail_message(text) {
    let div = window.n_mails_mail_message.cloneNode(true);
    div.innerText = text;
    return div;
}

function create_div_mails_mail_options_button() {
    return window.n_mails_mail_options_button.cloneNode(true);
}

function create_form_mails_new_mail_form() {
    let form = window.n_mails_new_mail_form.cloneNode(true);

    let options = create_div_mails_mail_options();
    add_new_mail_options(options);

    let receivers = window.n_mails_new_mail_receivers.cloneNode(true);
    receivers.id = 'receivers';
    receivers = create_input_with_label(receivers, 'Кому:');

    let subject = window.n_mails_new_mail_subject.cloneNode(true);
    subject.id = 'subject';
    subject = create_input_with_label(subject, 'Тема:');

    let message = window.n_mails_new_mail_message.cloneNode(true);
    message.id = 'message';

    function create_input_with_label(input, text) {
        let line = window.n_mails_new_mail_line.cloneNode(true);
        let label = window.n_mails_new_mail_label.cloneNode(true);
        label.innerText = text;
        line.appendChild(label);
        line.appendChild(input);
        return line;
    }
    function add_new_mail_options(div) {

        let back = create_options_button(div, 'Назад');
        back.addEventListener('click', (event) => {
        get_received_mails(receivers, message);
    })

        let send = create_options_button(div, 'Отправить');
        send.addEventListener('click', (event) => {
            receivers = document.querySelector('#receivers').value;
            subject = document.querySelector('#subject').value;
            message = document.querySelector('#message').value;
            send_mail([receivers], subject, message);
        })
    }

    [options, receivers, subject, message].forEach(input => form.appendChild(input));
    return form;
}