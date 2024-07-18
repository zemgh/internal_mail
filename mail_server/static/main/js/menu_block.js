let new_mail = document.querySelector('.new_mail_button')
new_mail.addEventListener('click', (event) => {
    window.MailManager.create()
})

let received_mails = document.querySelector('#received_mails')
received_mails.addEventListener('click', (event) => {
    window.MailManager.received()
})

let deleted_mails = document.querySelector('#deleted_mails')
deleted_mails.addEventListener('click', (event) => {
    window.MailManager.deleted()
})
