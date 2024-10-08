// let new_mail = document.querySelector('.new_mail_button');
// new_mail.addEventListener('click', () => {
//     MAILS_MANAGER.get_new_mail_form();
// })
//
//
// let received_mails = document.querySelector('#received_mails');
// received_mails.addEventListener('click', (event) =>
//     MAILS_MANAGER.show_received());
//
//
// let sent_mails = document.querySelector('#sent_mails');
// sent_mails.addEventListener('click', (event) =>
//     MAILS_MANAGER.show_sent());
//
//
// let deleted_mails = document.querySelector('#deleted_mails');
// deleted_mails.addEventListener('click', (event) =>
//     MAILS_MANAGER.show_deleted());
//
//
// let drafts = document.querySelector('#drafts');
// drafts.addEventListener('click', (event) =>
//     MAILS_MANAGER.show_drafts());

class MenuManager {
    constructor() {
        this.new_mail = document.querySelector('.new_mail_button');
        this.received_mails = document.querySelector('#received_mails');
        this.sent_mails = document.querySelector('#sent_mails');
        this.deleted_mails = document.querySelector('#deleted_mails');
        this.drafts = document.querySelector('#drafts');
        this.#add_events();
    }

    #add_events() {
        this.new_mail.addEventListener('click', () =>
            MAILS_MANAGER.get_new_mail_form()
        );
        this.received_mails.addEventListener('click', () =>
            MAILS_MANAGER.show_received()
        );
        this.sent_mails.addEventListener('click', () =>
            MAILS_MANAGER.show_sent()
        );
        this.deleted_mails.addEventListener('click', () =>
            MAILS_MANAGER.show_deleted()
        );
        this.drafts.addEventListener('click', () =>
            MAILS_MANAGER.show_drafts()
        );
    }
}

