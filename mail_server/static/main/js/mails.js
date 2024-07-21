const MAILS = document.querySelector('.mails');

window.MailManager = {
    received: get_received_mails,
    deleted: get_deleted_mails,
    sent: get_sent_mails,
    open: show_mail,
    create: create_mail
}
window.MailManager.mails = {
    send: send_mail,
    delete: delete_mails,
    update: update_mails_and_mails_list,
    recovery: recovery_mails,
    read: read_mails
}

window.MailManager.check = {}


function get_received_mails() {
    //      Меню - Входящие

    window.current_page = 'received';
    if (window.mails_block == null)
        window.mails_block = create_mails_list(window.mails_list, window.current_page);
    show_mails_block(window.mails_block)
}


function get_sent_mails() {
    //      Меню - Исходящие

    window.current_page = 'sent';
    if (window.sent_mails_block == null)
        window.mails_block = create_mails_list(window.sent_mails_list, window.current_page);
    show_mails_block(window.sent_mails_block)
}


function get_deleted_mails() {
    //      Меню - Удалённые

    window.current_page = 'deleted';
    if (window.deleted_mails_block == null)
        window.deleted_mails_block = create_mails_list(window.deleted_mails_list, window.current_page);
    show_mails_block(window.deleted_mails_block)
}


function show_mail(mail) {
    //      Показать письмо

    if (!mail.read)
        MailManager.mails.read([mail.id], false)

    let type;
    window.current_mail = mail;
    if (window.current_page !== 'mail') {
        type = window.current_page;
        window.previous_page = window.current_page;
        window.current_page = 'mail';
    } else type = window.previous_page

    clear_mails();

    let mail_block = ElementsManager.samples.mail_view.cloneNode(true);
    let options_block = ElementsManager.options_blocks[type].cloneNode(true);
    mail_block.prepend(options_block);

    mail_block.querySelector('.m_info').innerHTML =
        `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`;
    mail_block.querySelector('.m_message').innerText = mail.message;

    let back = options_block.querySelector('#back');
    back.addEventListener('click', (event) =>
        go_back())

    if (type === 'received') {
        let reply = options_block.querySelector('#reply');
        reply.addEventListener('click', (event) =>
            MailManager.create(true, mail));

        let del = options_block.querySelector('#del');
        del.addEventListener('click', (event) =>
            MailManager.mails.delete([mail.id]))
    }

    if (type === 'deleted') {
        let reply = options_block.querySelector('#reply');
        reply.addEventListener('click', (event) =>
            MailManager.create(true, mail));

        let recovery = options_block.querySelector('#recovery');
        recovery.addEventListener('click', (event) =>
            MailManager.mails.recovery([mail.id]));
    }

    MAILS.appendChild(mail_block)
}


function create_mail(reply=false, mail=undefined, back_type) {
    //      Создать письмо

    if (window.current_page !== 'mail') {
        window.previous_page = window.current_page;
        window.current_page = 'mail';
        }

    clear_mails();

    let form = ElementsManager.samples.new_mail.cloneNode(true);
    if (reply)
        add_reply_attrs(form);

    let back = form.querySelector('#back');
    back.addEventListener('click', (event) => {
        if (reply)
            MailManager.open(window.current_mail);
        else go_back();
    })

    let send = form.querySelector('#send');
    send.addEventListener('click', (event) => {
        let receivers = form.querySelector('#receivers').value;
        let subject = form.querySelector('#subject').value;
        let message = form.querySelector('#message').value;
        MailManager.mails.send([receivers], subject, message);
    })

    MAILS.appendChild(form);

    function add_reply_attrs(form) {
        form.querySelector('#receivers').value = mail.sender;
        form.querySelector('#subject').value =
            (mail.subject.slice(0, 4) === 'Re: ') ? (mail.subject) : (`Re: ${mail.subject}`);
        form.querySelector('#message').value =
            '\n\n' +
            '*'.repeat(20) +
            `\n\n${mail.created.long}` +
            `\nОт ${mail.sender}` +
            `\n\n${mail.message}`
    }
}


function create_mails_list(m_list, type) {
    //      Создать блок писем

    let mails_block = ElementsManager.samples.mails_block.cloneNode(true);
    mails_block.id = type;

    if (type !== 'sent') {
        //      Создание блока опций

        let option = type === 'received' ? 'received_list' : 'deleted_list';
        let options_block = ElementsManager.options_blocks[option];
        add_event_to_group_checkbox(options_block);
        mails_block.appendChild(options_block);
    }

    add_mails_to_block(m_list, mails_block);
    return mails_block;

    function add_mails_to_block (m_list, mails_block) {
        //      Добавление писем в блок

        for (let m of m_list) {
            let line = ElementsManager.samples.mails_line.cloneNode(true);
            let inner_line = line.querySelector('#inner_line');
            let sender = line.querySelector('#sender');
            let subject = line.querySelector('#subject');
            let datetime = line.querySelector('#datetime');

            if (m.read)
                inner_line.className = 'mb_inner_line';
            else
                inner_line.className = 'mb_inner_line_unread';

            if (type !== 'sent') {
                //      Добавление чекбокса письма

                let checkbox = ElementsManager.creater.base_node('input', {type: 'checkbox', className: 'mb_line_checkbox'});
                checkbox.id = m.id;
                checkbox.addEventListener('change', (event) => {
                    if (checkbox.checked)
                        window.mails_selected.push(checkbox.id);
                    else {
                        let index = window.mails_selected.indexOf(checkbox.id);
                        window.mails_selected.splice(index, 1);
                    }

                    check_buttons_status(mails_block)
                    check_group_checkbox_status(mails_block)
                })

                line.insertBefore(checkbox, inner_line);
            }

            if (type === 'sent')
                sender.innerText = m.receivers;
            else sender.innerText = m.sender;

            subject.innerText = m.subject;
            datetime.innerText = m.created.short;

            inner_line.addEventListener('click', (event) => {
                MailManager.open(m);
            })

            mails_block.appendChild(line);
        }
    }

    function add_event_to_group_checkbox(block=false, checkbox=false) {
        //      Добавление эвента группового checkbox

        if (!block)
            block = document.querySelector('.mails_block')
        if (!checkbox)
            checkbox = block.querySelector('#group_checkbox');

        checkbox.addEventListener('change', (event) => {
            let checkboxes = mails_block.querySelectorAll('.mb_line_checkbox');
            if (checkbox.checked === true) {
                checkboxes.forEach(el => {
                    el.checked = true;
                    if (!window.mails_selected.includes(el.id))
                        window.mails_selected.push(el.id);
                });
            }
            else {
                checkboxes.forEach(el => el.checked = false);
                window.mails_selected = [];
            }

            check_buttons_status(mails_block)
        })
    }

    function check_group_checkbox_status(block=false, checkbox=false) {
        //      Проверка статута группового checkbox

        if (!block)
            block = document.querySelector('.mails_block')
        if (!checkbox)
            checkbox = block.querySelector('#group_checkbox');

        if (window.mails_selected.length > 0 && checkbox.checked === false)
            checkbox.checked = true;
        else if (window.mails_selected.length === 0 && checkbox.checked === true)
            checkbox.checked = false;
    }

    function check_buttons_status(block) {
        //      Корректировка статуса (вкл/выкл) кнопок опций

        if (window.mails_selected.length === 0) {
            let buttons = block.querySelectorAll('.mb_options_button');
            if (buttons.length !== 0)
                make_disabled(buttons);

        } else if (window.mails_selected.length > 0) {
            let buttons = block.querySelectorAll('.mb_options_button_disabled');
            if (buttons.length !== 0) {
                make_enabled(buttons);

                if (type === 'received') {
                    //      Кнопки удалить/прочитать

                    let del = block.querySelector('#mass_delete');
                    del.addEventListener('click', (event) => {
                        MailManager.mails.delete(window.mails_selected, false);
                        make_disabled(buttons);
                    })

                    let read = block.querySelector('#mass_read');
                    read.addEventListener('click', (event) => {
                        MailManager.mails.read(window.mails_selected, false);
                        make_disabled(buttons);
                        check_group_checkbox_status(block)
                    })
                }

                if (type === 'deleted') {
                    //      Кнопка восстановить

                    let recovery = block.querySelector('#mass_recovery');
                    recovery.addEventListener('click', event => {
                        MailManager.mails.recovery(window.mails_selected, false);
                        make_disabled(buttons);
                        check_group_checkbox_status(block)
                    })
                }

            }
        }

        function make_disabled(buttons) {
            //      Кнопки опций вкл

            buttons.forEach(el => {
                el.className = 'mb_options_button_disabled';
                el.removeEventListener('click', this.event);
            })
        }

        function make_enabled(buttons) {
        //      Кнопки опций выкл

            buttons.forEach(el => el.className = 'mb_options_button');
        }
    }

}


function show_mails_block(block) {
    //      Показать блок писем

    clear_mails();
    MAILS.appendChild(block);
}


function clear_mails() {
    //      Очистка окна MAILS

    let block;
    let mails_list = MAILS.querySelector('.mails_block');

    if (mails_list) {
        if (window.mails_selected.length > 0) {
            window.mails_selected = [];

            switch (mails_list.id) {
                case 'received':
                    block = window.mails_block;
                    clear_mails_block(block)
                    break;
                case 'deleted':
                    block = window.deleted_mails_block;
                    clear_mails_block(block)
                    break;
            }
        }
        MAILS.removeChild(mails_list);
    }

    else {
        let mail = MAILS.querySelector('.mail');
        if (mail)
            MAILS.removeChild(mail);

        else {
            let new_mail = MAILS.querySelector('.nm_form');
            if (new_mail)
                MAILS.removeChild(new_mail);
        }
    }

    function clear_mails_block(block) {
        ElementsManager.creater.clear_checkboxes(block);
        block.querySelectorAll('.mb_options_button').forEach(
            el => el.className = 'mb_options_button_disabled')
        block.querySelector('#group_checkbox').checked = false;
    }
}


function update_mails_and_mails_list(received, sent, deleted) {
    //      Обновить списки/блоки писем

    if (received !== window.mails_list) {
        window.mails_list = received;
        window.mails_block = create_mails_list(received, 'received');
    }

    if (sent !== window.sent_mails_list) {
        window.sent_mails_list = sent;
        window.sent_mails_block = create_mails_list(sent, 'sent');
    }

    if (deleted !== window.deleted_mails_list) {
        window.deleted_mails_list = deleted;
        window.deleted_mails_block = create_mails_list(deleted, 'deleted');
    }
}


function send_mail(receivers, subject, message) {
    //      Отправить письмо

    let data = {
        'type': 'create_mail',
        'receivers': receivers,
        'subject': subject,
        'message': message
    }
    send_data(data);
    go_back();
}


function delete_mails(mails_lst, back=true) {
    //      Удалить письма

    let data = {'type':'delete_mails', 'mails_list': mails_lst};
    send_data(data);
    if (back)
        go_back();
}


function recovery_mails(mails_lst, back=true) {
    //      Восстановить письма из удалённых

    let data = {'type':'recovery_mails', 'mails_list': mails_lst};
    send_data(data);
    if (back)
        go_back();
}

function read_mails(mails_lst, back=true) {
    //      В прочитанные

    let data = {'type':'read_mails', 'mails_list': mails_lst};
    send_data(data);
    if (back)
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