class MailsManager {
    #MAILS = document.querySelector('.mails');


    constructor() {
        this.ReceivedBlock = new MailsBlock('received');
        this.SentBlock = new MailsBlock('sent');
        this.DeletedBlock = new MailsBlock('deleted');
        this.current_block = this.ReceivedBlock;
    }

    update_blocks(message) {
        this.ReceivedBlock.update(message.received);
        this.SentBlock.update(message.sent);
        this.DeletedBlock.update(message.deleted);
        this.update_current_page();
    }


    show_received() {
        this.current_block = this.ReceivedBlock;
        this.show_mails_block(this.ReceivedBlock);
    }


    show_sent() {
        this.current_block = this.SentBlock;
        this.show_mails_block(this.SentBlock);
    }


    show_deleted() {
        this.current_block = this.DeletedBlock;
        this.show_mails_block(this.DeletedBlock);
    }


    update_current_page() {
        if (this.current_block.refresh === true)
            this.show_mails_block(this.current_block);
    }


    show_mails_block(obj) {
        this.#clear();
        obj.show_mails();
    }


    send(receivers, subject, message) {
        let data = {
            'type': 'create_mail',
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


    #clear() {
        this.#MAILS.innerHTML = "";
    }

}