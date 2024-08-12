let test_button_1 = document.querySelector('#test_mail');
let test_button_2 = document.querySelector('#test_delayed_mail');
let test_button_3 = document.querySelector('#set_ping');
test_button_1.addEventListener('click', (event) => MAILS_MANAGER.get_test_mail());
test_button_2.addEventListener('click', (event) => MAILS_MANAGER.get_test_delayed_mail());
test_button_3.addEventListener('click', (event) => MAILS_MANAGER.set_ping());


class ContactsManager {
    block = document.querySelector('.contacts');
    base_line = ElementsManager.samples.contacts_line.cloneNode(true);

    list = this.block.querySelector('#contacts_list')
    add_button = this.block.querySelector('#add_button');
    add_input = this.block.querySelector('#add_input');

    context_menu = ElementsManager.samples.context_menu.cloneNode(true);
    context_menu_state = 0;
    selected_user = null;

    wait = false;

    constructor() {
        this.add_button.addEventListener('click', () => {
            let username = this.add_input.value;
            if (!username)
                alert('Введите имя пользователя!');
            else
                this.#add_user(username);
        })
        this.#create_context_menu();
    }

    create_users_list(users_list, update=true) {
        if (update)
            this.#clear_user_list();
        for (let user of users_list) {
            let line = this.#create_user_line(user);
            this.list.appendChild(line);
        }
    }

    clear_input() {
        this.add_input.value = '';
    }

    set_ping(ping) {
        if (ping)
            test_button_3.innerHTML = 'Стандартный пинг';
        else
            test_button_3.innerHTML = 'Увеличить пинг +1с';
    }

    #create_user_line(username) {
        let line = this.base_line.cloneNode(true);
        line.innerText = username;

        line.addEventListener('click', (event) => {
            let menu = this.context_menu;
            menu.style.left = event.clientX + 10 + 'px';
            menu.style.top = event.clientY + 'px';

            if (this.context_menu_state)
                this.#hide_context_menu();
            else
                this.#show_context_menu(username);
        })
        return line;
    }

    #clear_user_list() {
        this.list.innerHTML = '';
    }

    #add_user(username) {
        if (!this.wait) {
            let data = {
                'type': 'add_user',
                'username': username
            }
            this.wait = true;
            CONNECTION_MANAGER.send(data);
        }
    }

    #remove_user(username) {
        let data = {
            'type': 'remove_user',
            'username': username
        }
        CONNECTION_MANAGER.send(data);
    }

    #create_context_menu() {
        let new_mail = this.context_menu.querySelector('#op_1_mail');
        new_mail.addEventListener('click', () => {
            let user = this.selected_user;
            MAILS_MANAGER.get_new_mail_form(user);
            this.#hide_context_menu();
        })

        let del = this.context_menu.querySelector('#op_1_del');
        del.addEventListener('click', () => {
            let user = this.selected_user;
            this.#remove_user(user);
            this.#hide_context_menu();
        })

        let close = this.context_menu.querySelector('#op_1_close');
        close.addEventListener('click', () => this.#hide_context_menu());

        this.block.appendChild(this.context_menu);
    }

    #show_context_menu(username) {
        let menu = this.context_menu;
        menu.className = 'contacts_list_line_context_menu--active';
        this.context_menu_state = 1;
        this.selected_user = username;
    }

    #hide_context_menu() {
        this.context_menu.className = 'contacts_list_line_context_menu';
        this.context_menu_state = 0;
        this.selected_user = null;
    }
}