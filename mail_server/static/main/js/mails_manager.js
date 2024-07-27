class MailsManager {
    #MAILS = document.querySelector('.mails');


    constructor() {
        this.ReceivedBlock = new MailsBlock('received');
        this.SentBlock = new MailsBlock('sent');
        this.DeletedBlock = new MailsBlock('deleted');
        this.DraftsBlock = new MailsBlock('drafts')
        this.current_block = this.ReceivedBlock;
    }

    update_blocks(message) {
        this.ReceivedBlock.update(message.received, message.unread);
        this.SentBlock.update(message.sent);
        this.DeletedBlock.update(message.deleted);
        this.DraftsBlock.update(message.drafts);
        this.update_current_page();
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

    update_current_page() {
        if (this.current_block.refresh === true)
            this.show_mails_block(this.current_block);
    }


    show_mails_block(obj) {
        if (this.current_block !== obj)
            obj.clear_selected();
        this.current_block = obj;
        this.#clear();
        obj.show_mails();
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


    raise_alert_error(text) {
        alert(text);
    }

    #clear() {
        this.#MAILS.innerHTML = "";
    }

}