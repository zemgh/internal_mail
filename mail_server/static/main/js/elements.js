window.ElementsManager = {}

ElementsManager.create = {
    base_node: create_base_node,
    append: append_child_elements,
    mail_view: create_mail_view_block,
    create_mail: create_new_mail_form
}

ElementsManager.samples = {
        mails_block: create_mails_block(),
        mails_list: create_mails_list(),
        mails_line: create_mails_line(),
        line_checkbox: create_line_checkbox()
}

function create_base_node(tag, options) {
    let node = document.createElement(tag);
    Object.assign(node, options)
    return node;
}


function append_child_elements(parent, array) {
    array.forEach(el => parent.appendChild(el));
    return parent;
}


function create_mails_block() {
    //      Блок писем
    return ElementsManager.create.base_node('div', {className: 'mails_block'})
}


function create_mails_list() {
    //      Список писем
    return ElementsManager.create.base_node('div', {className: 'mails_list'})
}

function create_mails_line() {
    //      Письмо в списке +
    let line = ElementsManager.create.base_node('div', {className: 'mb_line'});
    let inner_line = ElementsManager.create.base_node('div', {id: 'inner_line'});
    let sender = ElementsManager.create.base_node('div', {className: 'mb_line_sender', id: 'sender'});
    let subject = ElementsManager.create.base_node('div', {className: 'mb_line_subject', id: 'subject'});
    let datetime = ElementsManager.create.base_node('div', {className: 'mb_line_datetime', id: 'datetime'});

    append_child_elements(inner_line, [sender, subject, datetime]);
    return append_child_elements(line, [inner_line]);
}


function create_line_checkbox() {
    //      Чекбокс письма +

    return ElementsManager.create.base_node('input', {type: 'checkbox', className: 'mb_line_checkbox'});
}


function create_mail_view_block(type) {
    //      Просмотр письма

    let block = ElementsManager.create.base_node('div', {className: 'mail', hidden: true});
    let options_block = create_mail_options_block(type);
    let info = ElementsManager.create.base_node('div', {className: 'm_info'});
    let message = ElementsManager.create.base_node('div', {className: 'm_message'});

    return append_child_elements(block, [options_block, info, message]);

    function create_mail_options_block(type) {
    //      Создание блока опций

        let options_block = ElementsManager.create.base_node('div', {className: 'm_options'});

        let back = create_options_button('back', 'Назад');
        append_child_elements(options_block, [back]);

        if (type === 'received') {
            let reply = create_options_button('reply', 'Ответить');
            let del = create_options_button('del', 'Удалить');
            append_child_elements(options_block, [reply, del]);
        }

        else if (type === 'deleted') {
            let reply = create_options_button('reply', 'Ответить');
            let recovery = create_options_button('recovery', 'Восстановить');
            append_child_elements(options_block, [reply, recovery]);
        }

        else if (type === 'new') {
            let sent = create_options_button('send', 'Отравить');
            append_child_elements(options_block, [sent]);
        }

        return options_block;
    }
}


function create_new_mail_form() {
    //      Создание письма

    let main_block = ElementsManager.create.base_node('form', {className: 'nm_form'});
    let options_block = create_new_mail_options_block();
    let receivers = create_input_with_label('receivers', 'Кому:');
    let subject = create_input_with_label('subject', 'Тема:');
    let message = ElementsManager.create.base_node('textarea', {className: 'nm_message', id: 'message'});

    return append_child_elements(main_block, [options_block, receivers, subject, message]);

    function create_input_with_label(id, text) {
        let line = ElementsManager.create.base_node('div',{className: 'nm_line'});
        let input = ElementsManager.create.base_node('input', {type: 'text', className: 'nm_receivers_subject', id: id});
        let label = ElementsManager.create.base_node('div', {className: 'nm_label', innerText: text});

        return append_child_elements(line, [label, input]);
    }

    function create_new_mail_options_block() {
        let options_block = ElementsManager.create.base_node('div', {className: 'm_options'});

        let back = create_options_button('back', 'Назад');
        let send = create_options_button('send', 'Отправить');
        let draft = create_options_button('draft', 'В черновик');

        return append_child_elements(options_block, [back, send, draft]);
    }
}


function create_options_button(id, text) {
    return ElementsManager.create.base_node('div', {className: 'm_options_button', id: id, innerText: text});
}

function create_mails_list_options_block(type) {
    let options_block = ElementsManager.create.base_node('div', {className: 'mb_options'});
    let checkbox = ElementsManager.create.base_node('input', {type: 'checkbox', id: 'group_checkbox'});
    options_block.appendChild(checkbox);

    if (type === 'received_list') {
        let del = create_options_button('mass_delete', 'Удалить');
        let read = create_options_button('mass_read', 'Прочитано');
        append_child_elements(options_block, [del, read]);
    }

    else if (type === 'deleted_list') {
        let recovery = create_options_button('mass_recovery', 'Восстановить');
        recovery.disabled = true;
        options_block.appendChild(recovery);
    }

    function create_options_button(id, text) {
        return ElementsManager.create.base_node('div', {className: 'mb_options_button_disabled', id: id, innerText: text});
    }

    return options_block;
}


function clear_lines_checkboxes(mails_block) {
    let boxes = mails_block.querySelectorAll('.mb_line_checkbox');
    boxes.forEach(el => el.checked = false);
}
