class MailsBlock{
    #mail_creator;
    #mail_reader;
    #mails_list;

    refresh = true;

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
        this.#reset();
        this.#MAILS.appendChild(this.#block);
    }


    update(mails_list) {
        this.#mails_list.update_list(mails_list);
    }


    read_mail(mail) {
        if (mail.read === false) {
            this.read_mails([mail]);
        }

        this.#mails_list.hide();
        this.#mail_reader.show(mail);
    }


    close_mail() {
        this.#mail_reader.hide();
        this.#mails_list.show();
    }


    create_mail(reply_mail=null) {
        this.#mails_list.hide();
        this.#mail_reader.hide()
        this.#mail_creator.show(reply_mail);
    }


    send_mail(receivers, subject, message) {
        MAILS_MANAGER.send(receivers, subject, message);
    }


    read_mails(mails) {
        let id_list = [];
        for (let mail of mails)
            if (mail.read !== true)
                id_list.push(mail.id);

        this.#read_lines(id_list);
        MAILS_MANAGER.read(id_list);
    }


    delete_mails(id_list) {
        this.#mails_list.make_deleted(id_list);
        MAILS_MANAGER.delete(id_list);
    }


    recovery_mails(id_list) {
        this.#delete_lines(id_list);
        MAILS_MANAGER.recovery(id_list);
    }


    close_create_mail_form(reply_mail) {
        this.#mail_creator.hide();
        if (reply_mail) {
            this.#mail_reader.show(reply_mail);
        }
        else
            this.#mails_list.show();
    }


    #read_lines(id_list) {
        this.#mails_list.make_read(id_list);
    }


    #delete_lines(id_list) {
        this.#mails_list.make_deleted(id_list);
    }


    #create_mails_block() {
        ElementsManager.combine(this.#block, [this.#mail_creator.block, this.#mail_reader.block, this.#mails_list.block]);
    }


    #reset() {
        this.#mails_list.show();
        this.#mail_reader.hide();
        this.#mail_creator.hide();
    }
}


class MailsList {
    MAIL_LINE = MailLine;
    list = [];
    selected = [];

    block = ElementsManager.samples.mails_list.cloneNode(true);

    constructor(parent) {
        this.parent = parent;
    }


    update_list(list) {
        if (this.list !== list) {
            this.list = list;
            this.block.innerHTML = '';
            this.#mails_list_to_block();
        }
    }


    make_read(id_list) {
        let lines = this.block.querySelectorAll('.mb_line');
        lines.forEach(el => {
            if (el.id in id_list) {
                el.querySelector('#inner_line').className = 'mb_inner_line';
            }
        })
    }


    make_deleted(id_list) {
        let lines = this.block.querySelectorAll('.mb_line');
        lines.forEach(el => {
            if (el.id in id_list)
                el.remove();
        })
    }


    show() {
        this.block.style.display = 'flex';
        this.parent.refresh = true;
    }


    hide() {
        this.block.style.display = 'None';
        this.parent.refresh = false;
    }


    #mails_list_to_block() {
        for (let mail of this.list) {
            let line = new this.MAIL_LINE(mail, this);

            if (line.checkbox) {
                line.checkbox.addEventListener('change', (event) => {
                    if (line.checkbox.checked)
                        this.selected.push(line.checkbox.id);
                    else {
                        let index = this.selected.indexOf(line.checkbox.id);
                        this.selected.splice(index, 1);
                    }
                })
            }

            line.inner_line.addEventListener('click', (event) => this.parent.read_mail(mail));
            this.block.appendChild(line.block);
        }
    }
}


class MailViewer {
    mail = null;


    constructor(parent) {
        this.parent = parent;
        this.block = ElementsManager.create_mail_view(this.parent.type);
        this.info = this.block.querySelector('.m_info');
        this.message = this.block.querySelector('.m_message');

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
    block = ElementsManager.create_new_mail_form()
    receivers = this.block.querySelector('#receivers');
    subject = this.block.querySelector('#subject');
    message = this.block.querySelector('#message');


    constructor(parent) {
        this.parent = parent;
        this.#add_buttons_events();
    }


    show(mail=null) {
        this.reply_mail = mail;
        if (this.reply_mail)
            this.#add_reply_attrs();
        this.block.style.display = 'flex';
    }


    hide() {
        this.block.style.display = 'None';
        this.#clear_form();
    }


    #add_reply_attrs() {
        this.receivers.value = this.reply_mail.sender;
        this.subject.value =
            this.reply_mail.subject.slice(0, 4) === 'Re: '
                                            ?
                this.reply_mail.subject     :    `Re: ${this.reply_mail.subject}`;
        this.message.value =
            '\n\n' +
            '*'.repeat(20) +
            `\n\n${this.reply_mail.created.long}` +
            `\nОт ${this.reply_mail.sender}` +
            `\n\n${this.reply_mail.message}`
    }


    #clear_form() {
        this.reply_mail = null;
        this.#clear_reply_attrs();
    }


    #clear_reply_attrs() {
        this.receivers.value = '';
        this.subject.value = '';
        this.message.value = '';
    }


    #add_buttons_events() {
        let back = this.block.querySelector('#back');
        back.addEventListener('click', () => this.parent.close_create_mail_form(this.reply_mail));

        let send = this.block.querySelector('#send');
        send.addEventListener('click', () => {
            this.parent.send_mail([this.receivers.value], this.subject.value, this.message.value);
            back.click();
        })
    }
}


class MailLine {
    block = ElementsManager.samples.mails_line.cloneNode(true);
    inner_line = this.block.querySelector('#inner_line');
    sender = this.block.querySelector('#sender');
    subject = this.block.querySelector('#subject');
    datetime = this.block.querySelector('#datetime');


    constructor(mail, parent) {
        this.mail = mail;
        this.parent = parent
        this.block.id = mail.id;

        if (this.parent.type === 'received' || this.parent.type === 'deleted') {
            this.checkbox = ElementsManager.samples.line_checkbox.cloneNode(true);
            this.block.insertBefore(this.checkbox, this.block.firstChild);
        }

        if (parent.type === 'sent' || mail.read === true)
            this.inner_line.className = 'mb_inner_line';
            else this.inner_line.className = 'mb_inner_line_unread';

        if (this.parent.type === 'sent')
            this.sender.innerText = this.mail.receivers;
        else
            this.sender.innerText = this.mail.sender;

        this.subject.innerText = this.mail.subject;
        this.datetime.innerText = this.mail.created.short;
    }
}

