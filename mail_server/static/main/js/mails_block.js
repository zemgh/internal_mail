function MailsBlockClass(type, list=null) {
    this.MailLineCls = MailLineClass;
    this.MailCreaterCls = MailCreaterClass;
    this.MailViewerCls = MailViewerClass;

    this.MAILS = document.querySelector('.mails');
    this.type = type;
    this.mails_list = list;
    this.mails_selected = [];
    this.refresh = true;

    this.block = ElementsManager.samples.mails_block.cloneNode(true);
    this.MailCreater = new this.MailCreaterCls(this);
    this.MailViewer = new this.MailViewerCls(this);
    this.list = ElementsManager.samples.mails_list.cloneNode(true);

    append_child_elements(this.block, [this.MailCreater.block, this.MailViewer.block, this.list]);
    this.MailViewer.init_buttons_events(this.type);
    this.MailCreater.init_buttons_events();

    this.get_mails = function() {
        this.MAILS.appendChild(this.block);
    }


    this.update = function (mails_list) {
        if (this.mails_list !== mails_list) {
            this.mails_list = mails_list;
            this.list.innerHTML = '';
            this.mails_list_to_block();
        }
    }


    this.mails_list_to_block = function() {
        for (let mail of this.mails_list) {
            let line = new this.MailLineCls(mail, this);

            if (line.checkbox) {
                line.checkbox.addEventListener('change', (event) => {
                    if (line.checkbox.checked)
                        this.mails_selected.push(line.checkbox.id);
                    else {
                        let index = this.mails_selected.indexOf(line.checkbox.id);
                        this.mails_selected.splice(index, 1);
                    }
                })
            }

            line.inner_line.addEventListener('click', (event) =>
                this.read_mail(mail));

            this.list.appendChild(line.block);
        }
    }


    this.read_mail = function(mail) {
        this.hide_list();
        this.MailViewer.show_mail(mail);
    }


    this.create_mail = function(reply_mail=null) {
        if (reply_mail) {
            this.MailViewer.hide_mail(false);
            this.MailCreater.reply_mail = reply_mail;
        }
        else this.hide_list();

        this.MailCreater.new_mail();
    }


    this.hide_list = function() {
        this.list.style.display = 'None';
        this.refresh = false;
    }


    this.show_list = function() {
        this.list.style.display = 'flex';
        this.refresh = true;
    }


    this.reset = function() {
        this.show_list();
        this.MailViewer.hide_mail();
    }


    this.delete_lines = function(array) {
        let lines = this.list.querySelectorAll('.mb_line');
        lines.forEach(el => {
            if (el.id in array)
                el.remove();
        })
    }


    this.read_lines = function(array) {
        let lines = this.list.querySelectorAll('.mb_line');
        lines.forEach(el => {
            if (el.id in array) {
                el.querySelector('#inner_line').className = 'mb_inner_line';
            }
        })
    }
}


function MailLineClass(mail, parent) {
    this.parent = parent;
    this.mail = mail;
    this.block = ElementsManager.samples.mails_line.cloneNode(true);
    this.inner_line = this.block.querySelector('#inner_line');
    this.sender = this.block.querySelector('#sender');
    this.subject = this.block.querySelector('#subject');
    this.datetime = this.block.querySelector('#datetime');

    if (this.parent.type !== 'sent') {
        this.checkbox = ElementsManager.samples.line_checkbox.cloneNode(true);
        this.block.insertBefore(this.checkbox, this.block.firstChild);
    }

    this.block.id = mail.id;
    this.inner_line.className = mail.read === true ? 'mb_inner_line' : 'mb_inner_line_unread';

    if (this.parent.type === 'sent')
        this.sender.innerText = this.mail.receivers;
    else this.sender.innerText = this.mail.sender;

    this.subject.innerText = this.mail.subject;
    this.datetime.innerText = this.mail.created.short;
}


function MailViewerClass(parent) {
    this.parent = parent;
    this.mail = null;
    this.block = ElementsManager.create.mail_view(this.parent.type);
    this.info = this.block.querySelector('.m_info');
    this.message = this.block.querySelector('.m_message');

    this.show_mail = function(mail) {
        this.info.innerHTML = `Тема: ${mail.subject}<p>Отправитель: ${mail.sender}</p>${mail.created.long}`;
        this.message.innerText = mail.message;
        this.mail = mail;
        this.block.style.display = 'flex';

        if (this.mail.read === false) {
            this.mail.read = true;
            this.parent.read_lines([mail.id]);
            MailsManager.read_mails([mail.id]);
        }
    }


    this.hide_mail = function(reset=true){
        if (reset) {
            this.info.innerHTML = '';
            this.message.innerText = '';
        }
        this.block.style.display = 'None';
    }


    this.init_buttons_events = function () {
        let back = this.block.querySelector('#back');
        back.addEventListener('click', () => {
            this.hide_mail();
            this.parent.show_list();
        });

        if (this.parent.type === 'received') {
            let reply = this.block.querySelector('#reply');
            reply.addEventListener('click', () => this.parent.create_mail(this.mail));

            let del = this.block.querySelector('#del');
            del.addEventListener('click', () => {
                this.parent.delete_lines([this.mail.id])
                MailsManager.delete_mails([this.mail.id]);
                back.click();
            });
        }


        if (this.parent.type === 'deleted') {
            let reply = this.block.querySelector('#reply');
            reply.addEventListener('click', () => this.parent.create_mail(this.mail));

            let recovery = this.block.querySelector('#recovery');
            recovery.addEventListener('click', () => {
                this.parent.delete_lines([this.mail.id])
                MailsManager.recovery_mails([this.mail.id]);
                back.click();
            })
        }
    }

}


function MailCreaterClass(parent) {
    this.parent = parent;
    this.reply_mail = null;
    this.block = ElementsManager.create.create_mail()
    this.receivers = this.block.querySelector('#receivers');
    this.subject = this.block.querySelector('#subject');
    this.message = this.block.querySelector('#message');

    this.new_mail = function() {
        if (this.reply_mail)
            this.add_reply_attrs();
        this.block.style.display = 'flex';
    }


    this.add_reply_attrs = function() {
        this.receivers.value = this.reply_mail.sender;
        this.subject.value =
            this.reply_mail.subject.slice(0, 4) === 'Re: '
                                            ?
                this.reply_mail.subject     :    `Re: ${this.reply_mail.subject}`;
    }


    this.close_form = function() {
        this.block.style.display = 'None';
        if (this.reply_mail)
            this.parent.MailViewer.show_mail(this.reply_mail)
    }


    this.init_buttons_events = function () {
        let back = this.block.querySelector('#back');
        back.addEventListener('click', () => this.close_form())

        let send = this.block.querySelector('#send');
        send.addEventListener('click', () => {
            MailsManager.send_new_mail(this.receivers, this.subject, this.message);
            back.click();
        })
    }


}