let new_mail = document.querySelector('.new_mail_button');


let received_mails = document.querySelector('#received_mails');
received_mails.addEventListener('click', (event) =>
    MailsManager.show_received())

let sent_mails = document.querySelector('#sent_mails');
sent_mails.addEventListener('click', (event) =>
    MailsManager.show_sent())

let deleted_mails = document.querySelector('#deleted_mails');
deleted_mails.addEventListener('click', (event) =>
    MailsManager.show_deleted())

