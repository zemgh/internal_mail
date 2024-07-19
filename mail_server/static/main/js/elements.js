window.ElementsManager = {}

window.ElementsManager.create_node = {
        div: create_div,                      // css id text
        input: create_input,                  // type css name
        form: create_form,                    // css
        textarea: create_textarea,            // css, name
        options_button: create_options_button // id
}
window.ElementsManager.samples = {
        mails_block: create_mails_block(),
        mails_line: create_mails_line(),
        mail: create_mail(),
        new_mail: create_new_mail()
}


function create_mails_block() {
    //      Блок писем
    return window.ElementsManager.create_node.div('mails_block', 'mails_block');
}


function create_mails_line() {
    //      Письмо в списке
    let line = ElementsManager.create_node.div('mb_line');
    let checkbox = ElementsManager.create_node.input('checkbox', 'mb_line_checkbox', 'checkbox');
    let sender = ElementsManager.create_node.div('mb_line_sender', 'sender');
    let subject = ElementsManager.create_node.div('mb_line_subject', 'subject');
    let datetime = ElementsManager.create_node.div('mb_line_datetime', 'datetime');

    [checkbox, sender, subject, datetime].forEach(el => line.appendChild(el));
    return line;
}


function create_mail() {
    //      Просмотр письма
    let main_block = ElementsManager.create_node.div('mail', 'mail');
    let options_block = ElementsManager.create_node.div('m_options', 'm_options');
    create_buttons(options_block);
    let info = ElementsManager.create_node.div('m_info', 'm_info');
    let message = ElementsManager.create_node.div('m_message', 'm_message');

    [options_block, info, message].forEach(el => main_block.appendChild(el));
    return main_block;

    function create_buttons(options_block) {
        let back = create_options_button('back', 'Назад');
        let reply = create_options_button('reply', 'Ответить');
        let del = create_options_button('del', 'Удалить');
    [back, reply, del].forEach(el => options_block.appendChild(el));
    }
}


function create_new_mail() {
    //      Создание письма
    let main_block = ElementsManager.create_node.form('nm_form', 'nm_form');
    let options_block = ElementsManager.create_node.div('m_options', 'm_options');
    create_buttons(options_block);
    let receivers = create_input_with_label('receivers', 'Кому:');
    let subject = create_input_with_label('subject', 'Тема:');
    let message = ElementsManager.create_node.textarea('nm_message', 'message');

    [options_block, receivers, subject, message].forEach(el => main_block.appendChild(el));
    return main_block;

    function create_buttons(options_block) {
        let back = create_options_button('back', 'Назад');
        let send = create_options_button('send', 'Отправить');
        [back, send].forEach(el => options_block.appendChild(el));
    }

    function create_input_with_label(name, text) {
        let line = ElementsManager.create_node.div('nm_line');
        let input = ElementsManager.create_node.input('text','nm_receivers_subject', name);
        let label = ElementsManager.create_node.div('nm_label', undefined, text);
        line.appendChild(label);
        line.appendChild(input);
        return line;
    }
}


// Создание базовых элементов

function create_div(css, id=undefined, text=undefined) {
    let el = document.createElement('div');
    el.className = css;
    if (id) el.id = id;
    if (text) el.innerText = text;
    return el;
}

function create_input(type, css=undefined, name=undefined) {
    let el = document.createElement('input');
    el.type = type;
    el.className = css;
    el.name = name;
    el.id = name;
    return el;
}

function create_form(css, id=undefined) {
    let el = document.createElement('form');
    el.className = css;
    el.id = id;
    return el;
}

function create_textarea(css, name) {
    let el = document.createElement('textarea');
    el.className = css;
    el.name = name;
    el.id = name;
    return el;
}

function create_options_button(id, text) {
    return ElementsManager.create_node.div('m_options_button', id, text);
}