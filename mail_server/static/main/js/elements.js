window.ElementsManager = new ElementsManagerClass();


function ElementsManagerClass () {

    this.create_base_node = function (tag, options) {
        let node = document.createElement(tag);
        Object.assign(node, options)
        return node;
    }


    this.combine = function(parent, array) {
        array.forEach(el => parent.appendChild(el));
        return parent;
    }


    this.create_mails_block = function() {
        //      Блок писем
        return this.create_base_node('div', {className: 'mails_block'})
    }


    this.create_mails_list = function () {
        //      Список писем
        return this.create_base_node('div', {className: 'mails_list'})
    }


    this.create_mails_line = function(checkbox) {
        //      Письмо в списке +
        let line = this.create_base_node('div', {className: 'mb_line'});
        let inner_line = this.create_base_node('div', {id: 'inner_line'});
        let sender = this.create_base_node('div', {className: 'mb_line_sender', id: 'sender'});
        let subject = this.create_base_node('div', {className: 'mb_line_subject', id: 'subject'});
        let datetime = this.create_base_node('div', {className: 'mb_line_datetime', id: 'datetime'});

        this.combine(inner_line, [sender, subject, datetime]);
        return this.combine(line, [inner_line]);
    }


    this.create_line_checkbox = function() {
        //      Чекбокс письма +
        return this.create_base_node('input', {type: 'checkbox', className: 'mb_line_checkbox'});
    }


    this.create_mail_view = function(type) {
        //      Просмотр письма

        let block = this.create_base_node('div', {className: 'mail'});
        let options_block = this.create_mail_view_options_block(type);
        let info = this.create_base_node('div', {className: 'm_info'});
        let message = this.create_base_node('div', {className: 'm_message'});

        return this.combine(block, [options_block, info, message]);
    }


    this.create_mail_view_options_block = function(type) {
        //      Создание блока опций

        let options_block = this.create_base_node('div', {className: 'm_options'});

        let back = this.create_options_button('back', 'Назад');
        this.combine(options_block, [back]);

        if (type === 'received') {
            let reply = this.create_options_button('reply', 'Ответить');
            let del = this.create_options_button('del', 'Удалить');
            ElementsManager.combine(options_block, [reply, del]);
        }

        else if (type === 'deleted') {
            let reply = this.create_options_button('reply', 'Ответить');
            let recovery = this.create_options_button('recovery', 'Восстановить');
            ElementsManager.combine(options_block, [reply, recovery]);
        }

        else if (type === 'new') {
            let sent = this.create_options_button('send', 'Отравить');
            this.combine(options_block, [sent]);
        }

        return options_block;
    }


    this.create_new_mail_form = function() {
        //      Создание письма

        let main_block = this.create_base_node('form', {className: 'nm_form'});
        let options_block = this.create_new_mail_options_block();
        let receivers = this.create_input_with_label('receivers', 'Кому:');
        let subject = this.create_input_with_label('subject', 'Тема:');
        let message = this.create_base_node('textarea', {className: 'nm_message', id: 'message'});

        return this.combine(main_block, [options_block, receivers, subject, message]);
    }
    this.create_input_with_label = function(id, text) {
        let line = this.create_base_node('div',{className: 'nm_line'});
        let input = this.create_base_node('input', {type: 'text', className: 'nm_receivers_subject', id: id});
        let label = this.create_base_node('div', {className: 'nm_label', innerText: text});

        return this.combine(line, [label, input]);
        }


    this.create_new_mail_options_block = function() {
        let options_block = this.create_base_node('div', {className: 'm_options'});

        let back = this.create_options_button('back', 'Назад');
        let send = this.create_options_button('send', 'Отправить');
        let draft = this.create_options_button('draft', 'В черновик');

        return this.combine(options_block, [back, send, draft]);
    }


    this.create_options_button = function(id, text) {
        return this.create_base_node('div', {className: 'm_options_button', id: id, innerText: text});
    }


    this.samples = {
        mails_block: this.create_mails_block(),
        mails_list: this.create_mails_list(),
        mails_line: this.create_mails_line(),
        line_checkbox: this.create_line_checkbox()
    }
}


// function create_mails_list_options_block(type) {
//     let options_block = ElementsManager.create.base_node('div', {className: 'mb_options'});
//     let checkbox = ElementsManager.create.base_node('input', {type: 'checkbox', id: 'group_checkbox'});
//     options_block.appendChild(checkbox);
//
//     if (type === 'received_list') {
//         let del = create_options_button('mass_delete', 'Удалить');
//         let read = create_options_button('mass_read', 'Прочитано');
//         append_child_elements(options_block, [del, read]);
//     }
//
//     else if (type === 'deleted_list') {
//         let recovery = create_options_button('mass_recovery', 'Восстановить');
//         recovery.disabled = true;
//         options_block.appendChild(recovery);
//     }
//
//     function create_options_button(id, text) {
//         return ElementsManager.create.base_node('div', {className: 'mb_options_button_disabled', id: id, innerText: text});
//     }
//
//     return options_block;
// }
//
//
// function clear_lines_checkboxes(mails_block) {
//     let boxes = mails_block.querySelectorAll('.mb_line_checkbox');
//     boxes.forEach(el => el.checked = false);
// }
