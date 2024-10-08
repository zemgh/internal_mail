class MailsManager {
    #MAILS = document.querySelector('.mails');

    constructor() {
        this.ReceivedBlock = new MailsBlock('received');
        this.SentBlock = new MailsBlock('sent');
        this.DeletedBlock = new MailsBlock('deleted');
        this.DraftsBlock = new MailsBlock('drafts')

        this.#set_current_block(this.ReceivedBlock);
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

    get_new_mail_form(receiver=null) {
        this.#set_current_block(this.ReceivedBlock);
        this.show_received();
        this.current_block.create_mail(null, false, receiver);
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
            this.current_block.menu.style.color = 'black';
            this.#set_current_block(block);
        }

        this.current_block.show_mails();
    }

    get_mails(options) {
        let data = {
            'type': 'get_mails'
        }
        if (options)
            Object.assign(data, options);
        CONNECTION_MANAGER.send(data);
    }

    send_filter(type, options) {
        let data = {
            'type': 'filter',
            'filter_type': type,
            'filter_options' : options
        }
        CONNECTION_MANAGER.send(data);
    }

    send_mail(receiver, subject, message) {
        let data = {
            'type': 'create_mail',
            'receiver': receiver,
            'subject': subject,
            'message': message
        }
        CONNECTION_MANAGER.send(data);
    }

    send_delayed_mail(receiver, subject, message, dt) {
        let data = {
            'type': 'create_delayed_mail',
            'receiver': receiver,
            'subject': subject,
            'message': message,
            'dt': dt
        }
        CONNECTION_MANAGER.send(data);
    }

    send_draft(receiver, subject, message) {
        let data = {
            'type': 'create_draft',
            'receiver': receiver,
            'subject': subject,
            'message': message
        }
        CONNECTION_MANAGER.send(data);
    }

    save_draft(id, receiver, subject, message) {
        let data = {
            'type': 'save_draft',
            'id': id,
            'receiver': receiver,
            'subject': subject,
            'message': message
        }
        CONNECTION_MANAGER.send(data);
    }

    convert_to_mail(id, receiver, subject, message) {
        let data = {
            'type': 'convert_to_mail',
            'id': id,
            'receiver': receiver,
            'subject': subject,
            'message': message
        }
        CONNECTION_MANAGER.send(data);
    }

    delete(id_list) {
        let data = {
            'type': 'delete_mails',
            'mails_list': id_list
        }
        CONNECTION_MANAGER.send(data);
    }

    delete_drafts(id_list) {
        let data = {
            'type': 'delete_drafts',
            'drafts_list': id_list
        }
        CONNECTION_MANAGER.send(data);
    }

    recovery(id_list) {
        let data = {
            'type': 'recovery_mails',
            'mails_list': id_list
        }
        CONNECTION_MANAGER.send(data);
    }

    read(id_list, type) {
        let data = {
            'type': 'read_mails',
            'mails_list': id_list,
            'method': type
        }
        CONNECTION_MANAGER.send(data);
    }

    handle_command(message) {
        switch(message.command) {
            case 'close_create_form':
                this.current_block.close_create_mail_form();
                this.current_block.wait = false;
                break;

            case 'logout':
                window.location.replace(`http://${window.location.host}${message.url}`);
                break;

            case 'set_ping':
                window.CONTACTS_MANAGER.set_ping(message.ping);
        }
    }

    raise_alert_error(text) {
        this.current_block.wait = false;
        alert(text);
    }

    activate_demo_mod() {
        window.demo_mod = true;
        document.querySelector('#test_block').style.display = 'flex';
    }

    get_test_mail(){
        let data = {
            'type': 'create_test_mail',
        }
        CONNECTION_MANAGER.send(data);
    }

    get_test_delayed_mail() {
        let data = {
            'type': 'create_test_delayed_mail',
        }
        CONNECTION_MANAGER.send(data);
    }

    set_ping() {
        let data = {
            'type': 'set_ping'
        }
        CONNECTION_MANAGER.send(data);
    }

    #clear() {
        this.#MAILS.innerHTML = "";
    }

    #set_current_block(block) {
        this.current_block = block;
        block.menu.style.color = 'blue';
    }

}