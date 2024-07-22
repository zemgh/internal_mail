function MailsManagerClass() {
    this.MAILS = document.querySelector('.mails');
    this.ReceivedBlock = new MailsBlockClass('received');
    this.SentBlock = new MailsBlockClass('sent');
    this.DeletedBlock = new MailsBlockClass('deleted');
    this.current_block = this.ReceivedBlock;

    this.update_blocks = function (message) {
        this.ReceivedBlock.update(message.received);
        this.SentBlock.update(message.sent);
        this.DeletedBlock.update(message.deleted);
        this.update_current_page();
    }


    this.show_received = function () {
        this.current_block = this.ReceivedBlock;
        this.show_mails_block(this.ReceivedBlock)
    }


    this.show_sent = function () {
        this.current_block = this.SentBlock;
        this.show_mails_block(this.SentBlock)
    }


    this.show_deleted = function () {
        this.current_block = this.DeletedBlock;
        this.show_mails_block(this.DeletedBlock)
    }


    this.update_current_page = function () {
        if (this.current_block.refresh === true)
            this.show_mails_block(this.current_block);
    }


    this.clear = function () {
        this.MAILS.innerHTML = "";
    }


    this.show_mails_block = function (obj) {
        this.clear();
        this.current_block.reset();
        obj.get_mails();
    }


    this.send_new_mail = function(receivers, subject, message) {
        let data = {
            'type': 'create_mail',
            'receivers': receivers,
            'subject': subject,
            'message': message
        }
        ConnectionManager.send(data);
    }


    this.delete_mails = function(array) {
        let data = {
            'type': 'delete_mails',
            'mails_list': array
        }
        ConnectionManager.send(data);
    }


    this.recovery_mails = function(array) {
        let data = {
            'type': 'recovery_mails',
            'mails_list': array
        }
        ConnectionManager.send(data);
    }

    this.read_mails = function(array) {
        let data = {
            'type': 'read_mails',
            'mails_list': array
        }
        ConnectionManager.send(data);
    }


    this.get_test_mail = function() {
        let data = {
            'type': 'create_test_mail',
        }
        ConnectionManager.send(data);
    }


}