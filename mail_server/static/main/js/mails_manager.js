class MailsManager {
    #MAILS = document.querySelector('.mails');


    constructor() {
        this.ReceivedBlock = new MailsBlock('received');
        this.SentBlock = new MailsBlock('sent');
        this.DeletedBlock = new MailsBlock('deleted');
        this.DraftsBlock = new MailsBlock('drafts')

        this.current_block = this.ReceivedBlock;
        this.current_block.show_mails();
    }

    update_blocks(message) {
        if (message.received)
            this.ReceivedBlock.update(message.received, message.unread);
        if (message.sent)
            this.SentBlock.update(message.sent);
        if (message.deleted)
            this.DeletedBlock.update(message.deleted);
        if (message.drafts)
            this.DraftsBlock.update(message.drafts);
    }


    show_received() {
        this.show_mails_block(this.ReceivedBlock);
    }


    show_sent() {
        this.show_mails_block(this.SentBlock);
    }


    show_deleted() {
        this.show_mails_block(this.DeletedBlock);
    }


    show_drafts() {
        this.show_mails_block(this.DraftsBlock);
    }


    show_mails_block(block) {
        this.#clear();
        this.current_block.reset();

        if (this.current_block !== block) {
            this.current_block = block;
        }
        this.current_block.show_mails();
    }


    get_mails(options) {
        let data = {
            'type': 'get_mails'
        }
        if (options)
            Object.assign(data, options);
        CONNECTION.send(data);
    }

    send_filter(type, options) {
        let data = {
            'type': 'filter',
            'filter_type': type,
            'filter_options' : options
        }
        CONNECTION.send(data);
    }


    send_mail(receivers, subject, message) {
        let data = {
            'type': 'create_mail',
            'receivers': receivers,
            'subject': subject,
            'message': message
        }
        CONNECTION.send(data);
    }


    send_draft(receivers, subject, message) {
        let data = {
            'type': 'create_draft',
            'receivers': receivers,
            'subject': subject,
            'message': message
        }
        CONNECTION.send(data);
    }


    save_draft(id, receivers, subject, message) {
        let data = {
            'type': 'save_draft',
            'id': id,
            'receivers': receivers,
            'subject': subject,
            'message': message
        }
        CONNECTION.send(data);
    }


    convert_to_mail(id, receivers, subject, message) {
        let data = {
            'type': 'convert_to_mail',
            'id': id,
            'receivers': receivers,
            'subject': subject,
            'message': message
        }
        CONNECTION.send(data);
    }


    delete(id_list) {
        let data = {
            'type': 'delete_mails',
            'mails_list': id_list
        }
        CONNECTION.send(data);
    }


    delete_drafts(id_list) {
        let data = {
            'type': 'delete_drafts',
            'drafts_list': id_list
        }
        CONNECTION.send(data);
    }


    recovery(id_list) {
        let data = {
            'type': 'recovery_mails',
            'mails_list': id_list
        }
        CONNECTION.send(data);
    }


    read(id_list) {
        let data = {
            'type': 'read_mails',
            'mails_list': id_list
        }
        CONNECTION.send(data);
    }


    get_test_mail(){
        let data = {
            'type': 'create_test_mail',
        }
        CONNECTION.send(data);
    }


    handle_command(command) {
        switch(command) {
            case 'close_create_form': this.current_block.close_create_mail_form(); break;
        }
    }


    raise_alert_error(text) {
        alert(text);
    }


    #clear() {
        this.#MAILS.innerHTML = "";
    }

}