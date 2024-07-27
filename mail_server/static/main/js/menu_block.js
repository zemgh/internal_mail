let new_mail = document.querySelector('.new_mail_button');
new_mail.addEventListener('click', () => {
    MAILS_MANAGER.current_block = MAILS_MANAGER.ReceivedBlock;
    MAILS_MANAGER.show_received();
    MAILS_MANAGER.current_block.create_mail();
})


let received_mails = document.querySelector('#received_mails');
received_mails.addEventListener('click', (event) =>
    MAILS_MANAGER.show_received());


let sent_mails = document.querySelector('#sent_mails');
sent_mails.addEventListener('click', (event) =>
    MAILS_MANAGER.show_sent());


let deleted_mails = document.querySelector('#deleted_mails');
deleted_mails.addEventListener('click', (event) =>
    MAILS_MANAGER.show_deleted());


let drafts = document.querySelector('#drafts');
drafts.addEventListener('click', (event) =>
    MAILS_MANAGER.show_drafts())


