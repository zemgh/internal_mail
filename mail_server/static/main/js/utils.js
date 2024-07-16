function create_div(css, text=undefined, id=undefined) {
    let el = document.createElement('div');
    el.className = css
    if (text) el.innerText = text;
    if (id) el.id = id;
    return el
}
function create_input(type, name=undefined, id=undefined, css=undefined) {
    let el = document.createElement('input');
    el.className = css;
    el.type = type;
    el.id = id;
    el.name = name;
    return el;
}