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

        let base_block = this.create_base_node('div', {className: 'mails_list_base_block'});
        let list_block = this.create_base_node('div', {className: 'mails_list_block'});
        base_block.appendChild(list_block);
        return base_block;
    }


    this.create_mails_line = function(is_checkbox=false) {
        //      Письмо в списке

        let line = this.create_base_node('div', {className: 'list_line'});
        let inner_line = this.create_base_node('div', {id: 'inner_line'});
        let sender = this.create_base_node('div', {className: 'list_line_sender', id: 'sender'});
        let subject = this.create_base_node('div', {className: 'list_line_subject', id: 'subject'});
        let datetime = this.create_base_node('div', {className: 'list_line_datetime', id: 'datetime'});

        this.combine(inner_line, [sender, subject, datetime]);
        if (is_checkbox) {
            let checkbox = this.create_base_node('input', {type: 'checkbox', className: 'list_line_checkbox'});
            return this.combine(line, [checkbox, inner_line]);
        }
        else
            return this.combine(line, [inner_line]);
    }


    this.create_mail_view = function(type) {
        //      Просмотр письма

        let block = this.create_base_node('div', {className: 'mail'});
        let options_block = this.create_mail_view_options_block(type);
        let info = this.create_base_node('div', {className: 'view_info'});
        let message = this.create_base_node('div', {className: 'view_message'});

        return this.combine(block, [options_block, info, message]);
    }


    this.create_mail_view_options_block = function(type) {
        //      Создание блока опций

        let options_block = this.create_base_node('div', {className: 'view_options'});

        let back = this.create_options_button_for_mail('back', 'Назад');
        this.combine(options_block, [back]);

        if (type === 'received') {
            let reply = this.create_options_button_for_mail('reply', 'Ответить');
            let del = this.create_options_button_for_mail('del', 'Удалить');
            ElementsManager.combine(options_block, [reply, del]);
        }

        else if (type === 'deleted') {
            let reply = this.create_options_button_for_mail('reply', 'Ответить');
            let recovery = this.create_options_button_for_mail('recovery', 'Восстановить');
            ElementsManager.combine(options_block, [reply, recovery]);
        }

        else if (type === 'drafts') {
            let sent = this.create_options_button_for_mail('send', 'Отравить');
            this.combine(options_block, [sent]);
        }

        return options_block;
    }


    this.create_new_mail_form = function(type) {
        //      Создание письма

        let main_block = this.create_base_node('div', {className: 'create_form'});
        let options_block = this.create_new_mail_options_block(type);
        let delayed = this.create_delayed_checkbox();
        let delayed_options = this.create_delayed_options();
        let receivers = this.create_input_with_label_new_mail('receivers', 'Кому:');
        let subject = this.create_input_with_label_new_mail('subject', 'Тема:');
        let message = this.create_base_node('textarea', {className: 'create_message', id: 'message'});

        return this.combine(main_block, [options_block, delayed, delayed_options, receivers, subject, message]);
    }


    this.create_input_with_label_new_mail = function(id, text) {
        let line = this.create_base_node('div',{className: 'create_line'});
        let input = this.create_base_node('input', {type: 'text', className: 'create_receivers_subject', id: id});
        let label = this.create_base_node('div', {className: 'create_label', innerText: text});

        return this.combine(line, [label, input]);
    }

    this.create_delayed_checkbox = function() {
        let line = this.create_base_node('div', {className: 'create_line'});
        let checkbox = this.create_base_node('input', {type: 'checkbox', id: 'delayed'});
        let text = this.create_base_node('div', {innerText: 'отложенное письмо'});

        return this.combine(line, [checkbox, text]);
    }

    this.create_delayed_options = function() {
        let options_line = this.create_base_node('div', {id: 'delayed_options', className: 'create_delayed_option_line'});
        let date = this.create_base_node('input', {type: 'date', id: 'delayed_date', className: 'delayed_options_datetime'});
        let time = this.create_base_node('input', {type: 'time', id: 'delayed_time', className: 'delayed_options_datetime'});

        return this.combine(options_line, [date, time]);
    }


    this.create_new_mail_options_block = function(type) {
        //      Опции для создания письма

        let options_block = this.create_base_node('div', {className: 'view_options'});

        let back = this.create_options_button_for_mail('back', 'Назад');
        let send = this.create_options_button_for_mail('send', 'Отправить');

        let draft, del;
        if (type === 'drafts') {
            draft = this.create_options_button_for_mail('save', 'Сохранить');
            del = this.create_options_button_for_mail('del', 'Удалить');
            return this.combine(options_block, [back, send, draft, del]);
        }
        else {
            draft = this.create_options_button_for_mail('draft', 'В черновик');
            return this.combine(options_block, [back, send, draft]);
        }
    }


    this.create_options_button_for_mail = function(id, text) {
        //      Кнопка опций для письма/создания письма

        return this.create_base_node('div', {className: 'view_options_button', id: id, innerText: text});
    }


    this.create_mails_list_options_block = function(type) {
        //      Опции списка


        let options_block = this.create_base_node('div', {className: 'list_options'});
        let checkbox = this.create_base_node('input', {type: 'checkbox', id: 'group_checkbox'});
        options_block.appendChild(checkbox);

        if (type === 'received') {
            let del = this.create_options_button_for_list ('mass_delete', 'Удалить');
            let read = this.create_options_button_for_list ('mass_read', 'Прочитано');
            this.combine(options_block, [del, read]);
        }

        else if (type === 'deleted') {
            let recovery = this.create_options_button_for_list ('mass_recovery', 'Восстановить');
            recovery.disabled = true;
            options_block.appendChild(recovery);
        }

        else if (type === 'drafts') {
            let del = this.create_options_button_for_list ('mass_delete', 'Удалить');
            this.combine(options_block, [del]);
        }

        if (['send', 'drafts'].includes(type) === false) {
            let filter_block = this.create_base_node('div', {className: 'filter_block'});
            let filter = this.create_base_node('div', {id: 'show_filter', className: 'filter_hide', innerText: 'Фильтр'})
            filter_block.appendChild(filter);
            options_block.appendChild(filter_block);
        }

        return options_block;
    }

    this.create_options_button_for_list = function(id, text, active=false) {
        //      Кнопки для списка

        let class_name = active ? 'list_options_button' : 'list_options_button_disabled';
        return this.create_base_node('div', {className: class_name, id: id, innerText: text});
    }

    this.create_more_button = function() {
        return this.create_base_node('button', {className: 'list_more_button', id: 'more', innerText: 'Ещё письма'})
    }

    this.create_filter_block = function() {
        let block = this.create_base_node('div', {className: 'mails_filter'});
        let username = this.create_input_with_label_filter('username', 'Логин:');
        let first_name = this.create_input_with_label_filter('first_name', 'Фамилия:');
        let last_name = this.create_input_with_label_filter('last_name', 'Имя:');
        let first_date = this.create_input_with_label_filter('first_date', 'Начало:', true);
        let last_date = this.create_input_with_label_filter('last_date', 'Конец:', true);
        let filter_buttons = this.create_base_node('div', {className: 'filter_buttons_block'});
        let filter_send_button = this.create_base_node('button', {className: 'filter_button', id: 'filter', innerText: 'Показать'});
        let filter_reset_button = this.create_base_node('button', {className: 'filter_button', id: 'filter-reset', innerText: 'Сбросить'});
        this.combine(filter_buttons, [filter_send_button, filter_reset_button]);

        this.combine(block, [username, first_name, last_name, first_date, last_date, filter_buttons]);
        return block;
    }

    this.create_input_with_label_filter = function(id, text, date=false) {
        let line = this.create_base_node('div',{className: 'filter_line'});
        let input;
        if (!date)
            input = this.create_base_node('input', {type: 'text', className: 'filter_input', id: id});
        else
            input = this.create_base_node('input', {type: 'date', className: 'filter_input', id: id});
        let label = this.create_base_node('div', {className: 'filter_label', innerText: text});

        return this.combine(line, [label, input]);
    }

    this.create_contacts_user_line = function() {
        return this.create_base_node('div', {className: 'contacts_list_line'});
    }

    this.create_contacts_context_menu = function() {
        let menu = this.create_base_node('div', {className: 'contacts_list_line_context_menu', id: 'contact_menu'});
        let option_1 = this.create_base_node('div', {innerText: 'Написать', id: 'op_1_mail', className: 'contacts_list_line_context_menu_option'});
        let option_2 = this.create_base_node('div', {innerText: 'Удалить', id: 'op_1_del', className: 'contacts_list_line_context_menu_option'});
        let option_3 = this.create_base_node('div', {innerText: 'Отмена', id: 'op_1_close', className: 'contacts_list_line_context_menu_option'});
        return this.combine(menu, [option_1, option_2, option_3]);
    }

    this.samples = {
        mails_block: this.create_mails_block(),
        mails_list: this.create_mails_list(),
        mails_line: this.create_mails_line(),
        mails_line_with_checkbox: this.create_mails_line(true),
        more_button: this.create_more_button(),
        filter: this.create_filter_block(),
        contacts_line: this.create_contacts_user_line(),
        context_menu: this.create_contacts_context_menu()
    }
}
