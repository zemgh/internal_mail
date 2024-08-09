class MailsBlock{
    #mail_creator;
    #mail_reader;
    #mails_list;
    #filter;

    mails_per_page_multiplier = 1;

    wait = false;

    #MAILS = document.querySelector('.mails');
    #block = ElementsManager.samples.mails_block.cloneNode(true);


    constructor(type) {
        this.type = type;
        this.#mail_creator = new MailCreater(this);
        this.#mail_reader = new MailViewer(this);
        this.#mails_list = new MailsList(this);
        this.#create_mails_block();
    }


    show_mails() {
        this.#MAILS.appendChild(this.#block);
    }


    update(mails_list, unread=null) {
        if (this.type === 'received')
            this.#update_counter(unread);
        this.#mails_list.update_list(mails_list);
    }


    get_more_mails() {
        this.mails_per_page_multiplier++;
        let options = {};
        options[this.type] = this.number_of_mails;

        MAILS_MANAGER.get_mails(options);
    }


    send_filter(options) {
        for (let k in options) {
            if (options[k] === '')
                delete options[k];
        }
        MAILS_MANAGER.send_filter(this.type, options);
    }


    read_mail(mail) {
        this.#mails_list.hide();
        this.#mail_reader.show(mail);

        if (mail.read === false) {
            this.read_mails([mail.id]);
        }
    }


    close_mail() {
        this.#mail_reader.hide();
        this.#mails_list.show();
    }


    create_mail(reply_mail=null, draft=false, receivers=null) {
        this.#mails_list.hide();
        this.#mail_reader.hide();
        this.#mail_creator.show(reply_mail, receivers);
    }


    send_mail(receivers, subject, message) {
        if (!this.wait) {
            MAILS_MANAGER.send_mail(receivers, subject, message);
            this.wait = true;
        }
    }


    send_delayed_mail(receivers, subject, message, date, time) {
        MAILS_MANAGER.send_delayed_mail(receivers, subject, message, date, time)
    }


    send_draft(receivers, subject, message) {
        MAILS_MANAGER.send_draft(receivers, subject, message);
    }


    save_draft(id, receivers, subject, message) {
        MAILS_MANAGER.save_draft(id, receivers, subject, message);
    }


    convert_to_mail(id, receivers, subject, message) {
        if (!this.wait) {
            MAILS_MANAGER.convert_to_mail(id, receivers, subject, message);
            this.wait = true;
        }
    }


    read_mails(id_list) {
        this.#read_lines(id_list);
        MAILS_MANAGER.read(id_list);
    }


    delete_mails(id_list) {
        this.#mails_list.make_deleted(id_list);
        MAILS_MANAGER.delete(id_list);
    }


    delete_drafts(id_list) {
        this.#mails_list.make_deleted(id_list);
        MAILS_MANAGER.delete_drafts(id_list);
    }


    recovery_mails(id_list) {
        this.#delete_lines(id_list);
        MAILS_MANAGER.recovery(id_list);
    }


    close_create_mail_form(reply_mail=null) {
        this.#mail_creator.hide();
        if (reply_mail) {
            this.#mail_reader.show(reply_mail);
        }
        else
            this.#mails_list.show();
    }


    clear_selected() {
        this.#mails_list.clear_selected();
    }


    reset() {
        this.#mails_list.show();
        this.#mail_reader.hide();
        this.#mail_creator.hide();
        if (['sent', 'drafts'].includes(this.type) === false)
            this.#filter.hide();
        if (this.mails_per_page_multiplier !== 1) {
            this.mails_per_page_multiplier = 1;
            this.#mails_list.list = this.#mails_list.list.slice(0, window.MAILS_PER_PAGE * 2 + 1)

            let options = {};
            options[this.type] = 'default';
            window.MAILS_MANAGER.get_mails(options);
        }
        else
            this.#mails_list.reset();
    }


    get number_of_mails() {
        return window.MAILS_PER_PAGE * this.mails_per_page_multiplier
    }


    #update_counter(count) {
        let field = document.querySelector('#received_mails').querySelector('.menu_line_counter')
        if (count)
            field.innerText = count;
        else
            field.innerText = '';
    }


    #read_lines(id_list) {
        this.#mails_list.make_read(id_list);
    }


    #delete_lines(id_list) {
        this.#mails_list.make_deleted(id_list);
    }


    #create_mails_block() {
        ElementsManager.combine(this.#block, [this.#mail_creator.block, this.#mail_reader.block, this.#mails_list.block]);
        if (['sent', 'drafts'].includes(this.type) === false) {
            this.#filter = new Filter(this, this.#mails_list.block.querySelector('#show_filter'));
            this.#block.prepend(this.#filter.block);
            this.#filter.hide();
        }
    }


}


class MailsList {
    MAIL_LINE = MailLine;
    list = [];
    selected = [];
    checkboxes = [];
    buttons_enabled = false;

    block = ElementsManager.samples.mails_list.cloneNode(true);
    list_block = this.block.firstChild;


    constructor(parent) {
        this.parent = parent;

        if (this.parent.type !== 'sent') {
            this.options_block = ElementsManager.create_mails_list_options_block(parent.type);
            this.block.prepend(this.options_block);
            this.group_checkbox = this.block.querySelector('#group_checkbox');
        }
    }


    update_list(list) {
        if (this.list !== list) {
            this.list = list;
            this.list_block.innerHTML = '';
            this.#mails_list_to_block();
        }
    }


    reset() {
        this.list_block.innerHTML = '';
        this.#mails_list_to_block();
    }


    make_read(id_list) {
        let lines = this.block.querySelectorAll('.list_line');
        lines.forEach(el => {
            if (el.id in id_list) {
                el.querySelector('#inner_line').className = 'list_inner_line';
            }
        })
    }


    make_deleted(id_list) {
        let lines = this.block.querySelectorAll('.list_line');
        lines.forEach(el => {
            if (el.id in id_list)
                el.remove();
        })
    }


    show() {
        this.block.style.display = 'flex';
    }


    hide() {
        this.block.style.display = 'None';
        this.clear_selected();
    }


    clear_selected() {
        this.selected = [];
        if (this.group_checkbox)
            this.group_checkbox.checked = false;
        this.checkboxes.forEach(el => el.checked = false);
        this.#check_buttons_status();
    }


    #mails_list_to_block() {
        if (this.parent.type !== 'sent') {
            this.checkboxes = [];
        }
        let mails_list_total = this.list.length
        let mails_for_show = this.parent.number_of_mails

        for (let i = 0 ; i < mails_list_total && i < mails_for_show; i++) {
            let mail = this.list[i];
            let line = new this.MAIL_LINE(mail, this.parent.type);

            if (line.checkbox) {
                line.checkbox.addEventListener('change', (event) => {
                    if (line.checkbox.checked)
                        this.selected.push(line.checkbox.id);
                    else {
                        let index = this.selected.indexOf(line.checkbox.id);
                        this.selected.splice(index, 1);
                    }
                    this.#check_buttons_status();
                })

                if (this.selected.includes(line.checkbox.id))
                    line.checkbox.checked = true;

                this.checkboxes.push(line.checkbox);
            }

            line.inner_line.addEventListener('click', (event) => {
                if (this.parent.type === 'drafts')
                    this.parent.create_mail(mail, true);
                else
                    this.parent.read_mail(mail);
                if (this.group_checkbox && this.group_checkbox.checked)
                    this.clear_selected();
            })

            this.list_block.appendChild(line.block);
        }

        if (this.group_checkbox) {
            this.#add_group_checkbox_event();
        }

        if (this.parent.number_of_mails < this.list.length) {
            let more = ElementsManager.samples.more_button.cloneNode(true);
            this.list_block.appendChild(more);
            more.addEventListener('click', () => this.parent.get_more_mails());
        }
    }


    #add_group_checkbox_event() {
        this.group_checkbox.addEventListener('change', () => {
            if (this.group_checkbox.checked === true) {
                this.checkboxes.forEach(el => {
                    if (el.checked === false)
                        el.checked = true;
                })
                this.#select_all();
            }
            else {
                this.checkboxes.forEach(el => {
                    if (el.checked === true)
                    el.checked = false;
                });
                this.clear_selected();
            }

            this.#check_buttons_status();
        })
    }


    #select_all() {
        this.selected = [];
        this.checkboxes.forEach(el => {
            this.selected.push(el.id)
        })
    }


    #check_buttons_status() {
        if (this.selected.length > 0 && !this.buttons_enabled)
            this.#make_buttons_enabled();
        else if (this.selected.length === 0 && this.buttons_enabled)
            this.#make_buttons_disabled();
    }


    #make_buttons_enabled() {
        //      Кнопки опций вкл

        this.buttons_enabled = true;

        if (this.parent.type === 'received') {

            let del = this.options_block.querySelector('#mass_delete');
            del.className = 'list_options_button'
            del.addEventListener('click', (event) => {
                this.parent.delete_mails(this.selected);
                clear(this);
            })

            let read = this.options_block.querySelector('#mass_read');
            read.className = 'list_options_button';
            read.addEventListener('click', (event) => {
                this.parent.read_mails(this.selected);
                clear(this);
            })
        }

        else if (this.parent.type === 'deleted') {

            let recovery = this.options_block.querySelector('#mass_recovery');
            recovery.className = 'list_options_button'
            recovery.addEventListener('click', event => {
                this.parent.recovery_mails(this.selected);
                clear(this);
            })
        }

        else if (this.parent.type === 'drafts') {
            let del = this.options_block.querySelector('#mass_delete');
            del.className = 'list_options_button'
            del.addEventListener('click', (event) => {
                this.parent.delete_drafts(this.selected);
                clear(this);
            })
        }

        function clear(obj) {
            obj.clear_selected();
            obj.#check_buttons_status();
        }
    }


    #make_buttons_disabled() {
        //      Кнопки опций выкл

        this.buttons_enabled = false;
        let buttons;
        if (this.parent.type === 'received')
            buttons = this.options_block.querySelectorAll('#mass_delete, #mass_read');
        else if (this.parent.type === 'deleted')
            buttons = this.options_block.querySelectorAll('#mass_recovery');
        else if (this.parent.type === 'drafts')
            buttons = this.options_block.querySelectorAll('#mass_delete');

        buttons.forEach(el => {
            el.className = 'list_options_button_disabled';
            el.replaceWith(el.cloneNode(true));
        })
    }


}


class MailViewer {
    mail = null;


    constructor(parent) {
        this.parent = parent;
        this.block = ElementsManager.create_mail_view(this.parent.type);
        this.info = this.block.querySelector('.view_info');
        this.message = this.block.querySelector('.view_message');

        this.#add_buttons_events(this.parent.type);
    }


    show(mail) {
        this.info.innerHTML = `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`;
        this.message.innerText = mail.message;
        this.mail = mail;
        this.block.style.display = 'flex';
    }


    hide(){
        this.mail = null;
        this.info.innerHTML = '';
        this.message.innerText = '';
        this.mail = null;

        this.block.style.display = 'None';
    }


    #add_buttons_events() {
        let back = this.block.querySelector('#back');
        back.addEventListener('click', () => this.parent.close_mail());

        if (this.parent.type === 'received') {
            let reply = this.block.querySelector('#reply');
            reply.addEventListener('click', () => this.parent.create_mail(this.mail));

            let del = this.block.querySelector('#del');
            del.addEventListener('click', () => {
                this.parent.delete_mails([this.mail.id]);
                back.click();
            });
        }


        if (this.parent.type === 'deleted') {
            let reply = this.block.querySelector('#reply');
            reply.addEventListener('click', () => this.parent.create_mail(this.mail));

            let recovery = this.block.querySelector('#recovery');
            recovery.addEventListener('click', () => {
                this.parent.recovery_mails([this.mail.id]);
                back.click();
            })
        }
    }

}


class MailCreater {

    delayed_options_display = false;

    constructor(parent) {
        this.parent = parent;
        this.block = ElementsManager.create_new_mail_form(this.parent.type)
        this.receivers = this.block.querySelector('#receivers');
        this.subject = this.block.querySelector('#subject');
        this.message = this.block.querySelector('#message');
        this.delayed = this.block.querySelector('#delayed');
        this.delayed_options = this.block.querySelector('#delayed_options');
        this.date = this.block.querySelector('#delayed_date');
        this.time = this.block.querySelector('#delayed_time');
        this.#add_buttons_events();
        this.#add_delayed_event();
    }


    show(mail=null, receivers=null) {
        this.reply_mail = mail;
        if (this.reply_mail)
            this.#add_reply_attrs();
        if (receivers)
            this.receivers.value = receivers;
        this.block.style.display = 'flex';
    }


    hide() {
        this.block.style.display = 'None';
        this.#clear_form();
    }


    #add_reply_attrs() {
        if (this.parent.type === 'drafts') {
            this.receivers.value = this.reply_mail.receivers;
            this.message.value = this.reply_mail.message;
            this.subject.value = this.reply_mail.subject;
        }

        else {
            this.receivers.value = this.reply_mail.sender;

            if (this.reply_mail.subject.slice(0, 4) === 'Re: ')
                this.subject.value = this.subject.value = this.reply_mail.subject;
            else
                this.subject.value = `Re: ${this.reply_mail.subject}`;

            this.message.value =
                '\n\n' +
                '*'.repeat(20) +
                `\n\n${this.reply_mail.created.long}` +
                `\nОт ${this.reply_mail.sender}` +
                `\n\n${this.reply_mail.message}`;
        }
    }


    #clear_form() {
        this.reply_mail = null;
        this.#clear_reply_attrs();
        this.#delayed_hide();
    }


    #clear_reply_attrs() {
        this.receivers.value = '';
        this.subject.value = '';
        this.message.value = '';
    }


    #add_buttons_events() {
        let back = this.block.querySelector('#back');
        let send = this.block.querySelector('#send');

        if (this.parent.type === 'drafts') {
            back.addEventListener('click', () => this.parent.close_create_mail_form());

            send.addEventListener('click', () =>
                this.#check_data_and_send(
                    [this.receivers.value], this.subject.value, this.message.value, true, this.reply_mail.id));

            let save = this.block.querySelector('#save');
            save.addEventListener('click', () => {
                this.parent.save_draft(
                    this.reply_mail.id, [this.receivers.value], this.subject.value, this.message.value);
                back.click();
            })

            let del = this.block.querySelector('#del');
            del.addEventListener('click', () => {
                this.parent.delete_drafts([this.reply_mail.id]);
                back.click();
            })
        }

        else {
            back.addEventListener('click', () => this.parent.close_create_mail_form(this.reply_mail));

            send.addEventListener('click', () =>
                this.#check_data_and_send([this.receivers.value], this.subject.value, this.message.value));

            let draft = this.block.querySelector('#draft');
            draft.addEventListener('click', () => {
                this.parent.send_draft([this.receivers.value], this.subject.value, this.message.value);
                back.click();
            })
        }
    }


    #add_delayed_event() {
        this.delayed.addEventListener('click', () => {
            if (this.delayed_options_display)
                this.#delayed_hide();
            else
                this.#delayed_show();
        })
    }

    #delayed_show() {
        this.#set_datetime();
        this.delayed_options.style.display = 'flex';
        this.delayed_options_display = true;
    }


    #delayed_hide() {
        this.delayed_options.style.display = 'none';
        this.delayed_options_display = false;
        if (this.delayed.checked)
            this.delayed.checked = false
    }


    #set_datetime() {
        this.date.value = new Date().toISOString().split('T')[0];
        this.date.min = new Date().toISOString().split('T')[0];

        this.time.value = new Date().toISOString().substring(11,16);
    }


    #check_data_and_send(receivers, subject, message, convert_to_mail=false, id=null) {
        if (!receivers[0] || !subject || !message)
            return alert('Все поля должны быть заполнены!');

        if (this.delayed_options_display) {
            if (this.#check_datetime() === false)
                return alert('Время должно быть больше текущего!');
        }

        if (convert_to_mail)
            this.parent.convert_to_mail(id, receivers, subject, message);
        else if (this.delayed_options_display)
            this.parent.send_delayed_mail(receivers, subject, message, this.date.value, this.time.value)
        else
            this.parent.send_mail(receivers, subject, message);
    }

    #check_datetime() {
        let time = Number(this.time.value.replace(':', ''));
        let current_time = Number(new Date().toISOString().substring(11,16).replace(':', ''));

        if (this.date.value === new Date().toISOString().split('T')[0])
            if (time <= current_time)
                return false;
        return true;
    }
}


class Filter {

    block = ElementsManager.samples.filter.cloneNode(true);
    username = this.block.querySelector('#username');
    first_name = this.block.querySelector('#first_name');
    last_name = this.block.querySelector('#last_name');
    first_date = this.block.querySelector('#first_date');
    last_date = this.block.querySelector('#last_date');
    send_button = this.block.querySelector('#filter');
    reset_button = this.block.querySelector('#filter-reset');
    block_show = false;


    constructor(parent, show_button) {
        this.parent = parent;
        this.show_button = show_button;

        this.#set_min_max_dates_for_input();
        this.#add_date_inputs_events();
        this.#add_buttons_events();
    }


    show() {
        this.block.style.display = 'flex';
        this.block_show = true;
        this.#set_default_date();
        this.#add_show_button_event(this);
        this.show_button.className = 'filter_show';
    }


    hide() {
        this.block.style.display = 'None';
        this.block_show = false;
        this.#clear();
        this.#add_show_button_event(this);
        this.show_button.className = 'filter_hide';
    }


    #add_show_button_event(obj) {
        function hide_event() {
            obj.hide();
            obj.parent.send_filter({'reset': true})
        }

        function show_event() {
            obj.show();
        }

        if (this.block_show === true) {
            this.show_button.addEventListener('click', hide_event, {once: true});
        }

        if (this.block_show === false)
            this.show_button.addEventListener('click', show_event, {once: true});
    }


    #add_date_inputs_events() {
        this.first_date.addEventListener('change', () => {
            let last_date_min = new Date(this.first_date.value);
            this.last_date.min = last_date_min.toISOString().split('T')[0];
        })

        this.last_date.addEventListener('change', () => {
            let first_day_max = new Date(this.last_date.value);
            this.first_date.max = first_day_max.toISOString().split('T')[0];
        })
    }


    #add_buttons_events() {
        this.send_button.addEventListener('click', () => {
            this.parent.send_filter({
                'username': this.username.value,
                'first_name': this.first_name.value,
                'last_name': this.last_name.value,
                'first_date': this.first_date.value,
                'last_date': this.last_date.value
            })
        })

        this.reset_button.addEventListener('click', () => {
            this.#clear();
            this.send_button.click();
        })
    }


    #clear() {
        this.username.value = '';
        this.first_name.value = '';
        this.last_name.value = '';
    }


    #set_min_max_dates_for_input() {
        let last_date_max = new Date();
        this.last_date.max = last_date_max.toISOString().split('T')[0];

        let first_date_min = new Date();
        first_date_min.setFullYear(first_date_min.getFullYear() - 1);
        this.first_date.min = first_date_min.toISOString().split('T')[0];

        let last_date_min = new Date();
        last_date_min.setFullYear(last_date_min.getFullYear());
        this.last_date.min = last_date_min.toISOString().split('T')[0];

        let first_date_max = new Date();
        this.first_date.max = first_date_max.toISOString().split('T')[0];
    }


    #set_default_date() {
        let date = new Date()
        this.last_date.value = date.toISOString().split('T')[0];
        this.first_date.value = date.toISOString().split('T')[0];
    }


}


class MailLine {

    constructor(mail, type) {
        this.mail = mail;
        this.type = type;

        if (this.type === 'sent')
            this.block = ElementsManager.samples.mails_line.cloneNode(true);
        else {
            this.block = ElementsManager.samples.mails_line_with_checkbox.cloneNode(true);
            this.checkbox = this.block.querySelector('.list_line_checkbox');
            this.checkbox.id = mail.id;
        }

        this.inner_line = this.block.querySelector('#inner_line');
        this.sender = this.block.querySelector('#sender');
        this.subject = this.block.querySelector('#subject');
        this.datetime = this.block.querySelector('#datetime');
        this.block.id = mail.id;

        if (['sent', 'drafts'].includes(this.type) || mail.read === true)
            this.inner_line.className = 'list_inner_line';
        else
            this.inner_line.className = 'list_inner_line_unread';

        if (['sent', 'drafts'].includes(this.type))
            this.sender.innerText = this.mail.receivers;
        else
            this.sender.innerText = this.mail.sender;

        this.subject.innerText = this.mail.subject;
        this.datetime.innerText = this.mail.created.short;
    }


}

