window.ElementsManager = {}

window.ElementsManager.creater = {
    base_node: create_base_node,
    append: append_child_elements,
    clear_checkboxes: clear_lines_checkboxes
}

window.ElementsManager.options_blocks = {
    received: create_mail_options_block('received'),
    deleted: create_mail_options_block('deleted'),
    sent: create_mail_options_block('sent'),
    new_mail: create_mail_options_block('new'),
    received_list: create_mails_list_options_block('received_list'),
    deleted_list: create_mails_list_options_block('deleted_list')
}

window.ElementsManager.samples = {
        mails_block: create_mails_block(),
        mails_line: create_mails_line(),
        mail_view: create_mail_view(),
        new_mail: create_new_mail_form(),
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

    return ElementsManager.creater.base_node('div', {className: 'mails_block'})
}


function create_mails_line() {
    //      Письмо в списке
    let line = ElementsManager.creater.base_node('div', {className: 'mb_line'});
    let inner_line = ElementsManager.creater.base_node('div', {id: 'inner_line'});
    let sender = ElementsManager.creater.base_node('div', {className: 'mb_line_sender', id: 'sender'});
    let subject = ElementsManager.creater.base_node('div', {className: 'mb_line_subject', id: 'subject'});
    let datetime = ElementsManager.creater.base_node('div', {className: 'mb_line_datetime', id: 'datetime'});

    ElementsManager.creater.append(inner_line, [sender, subject, datetime]);
    return ElementsManager.creater.append(line, [inner_line]);
}


function create_mail_view() {
    //      Просмотр письма

    let block = ElementsManager.creater.base_node('div', {className: 'mail'});
    let info = ElementsManager.creater.base_node('div', {className: 'm_info'});
    let message = ElementsManager.creater.base_node('div', {className: 'm_message'});

    return ElementsManager.creater.append(block, [info, message]);
}


function create_new_mail_form() {
    //      Создание письма

    let main_block = ElementsManager.creater.base_node('form', {className: 'nm_form'});
    let options_block = ElementsManager.options_blocks['new_mail'].cloneNode(true);
    let receivers = create_input_with_label('receivers', 'Кому:');
    let subject = create_input_with_label('subject', 'Тема:');
    let message = ElementsManager.creater.base_node('textarea', {className: 'nm_message', id: 'message'});

    return ElementsManager.creater.append(main_block, [options_block, receivers, subject, message]);

    function create_input_with_label(id, text) {
        let line = ElementsManager.creater.base_node('div',{className: 'nm_line'});
        let input = ElementsManager.creater.base_node('input', {type: 'text', className: 'nm_receivers_subject', id: id});
        let label = ElementsManager.creater.base_node('div', {className: 'nm_label', innerText: text});

        return ElementsManager.creater.append(line, [label, input]);
    }
}


function create_mail_options_block(type) {
    //      Создание блока опций

    let options_block = ElementsManager.creater.base_node('div', {className: 'm_options'});
    let back = create_options_button('back', 'Назад');
    ElementsManager.creater.append(options_block, [back]);

    if (type === 'received') {
        let reply = create_options_button('reply', 'Ответить');
        let del = create_options_button('del', 'Удалить');
        ElementsManager.creater.append(options_block, [reply, del]);
    }

    else if (type === 'deleted') {
        let reply = create_options_button('reply', 'Ответить');
        let recovery = create_options_button('recovery', 'Восстановить');
        ElementsManager.creater.append(options_block, [reply, recovery]);
    }

    else if (type === 'new') {
        let sent = create_options_button('send', 'Отравить');
        ElementsManager.creater.append(options_block, [sent]);
    }

    function create_options_button(id, text) {
        return ElementsManager.creater.base_node('div', {className: 'm_options_button', id: id, innerText: text});
}

    return options_block;
}


function create_mails_list_options_block(type) {
    let options_block = ElementsManager.creater.base_node('div', {className: 'mb_options'});
    let checkbox = ElementsManager.creater.base_node('input', {type: 'checkbox', id: 'group_checkbox'});
    options_block.appendChild(checkbox);

    if (type === 'received_list') {
        let del = create_options_button('mass_delete', 'Удалить');
        let read = create_options_button('mass_read', 'Прочитано');
        ElementsManager.creater.append(options_block, [del, read]);
    }

    else if (type === 'deleted_list') {
        let recovery = create_options_button('mass_recovery', 'Восстановить');
        recovery.disabled = true;
        options_block.appendChild(recovery);
    }

    function create_options_button(id, text) {
        return ElementsManager.creater.base_node('div', {className: 'mb_options_button_disabled', id: id, innerText: text});
    }

    return options_block;
}


function clear_lines_checkboxes(mails_block) {
    let boxes = mails_block.querySelectorAll('.mb_line_checkbox');
    boxes.forEach(el => el.checked = false);
}
