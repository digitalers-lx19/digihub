import forms from '../forms.json' with { type: 'json' };
export function Auth() {
    const root = document.getElementById('root');
    if (!root) return;
    const renderForm = ({id, className='form hidden modal-content', action = "/", method = "POST", fields = [], children = null}) => `
        <form id="${id}" class="${className}" action="${action}" method="${method}">
            ${fields.map(field => renderFormControl(field)).join('')}
            ${children ?? ''}
        </form>
    `
    const isRequired = (value) => value ? 'required' : '';
    const getFormControl = ({type, id, name, label, required, options, ...props}) => 
        /button|submit|reset/.test(type) ? 
            `<button class="form-control" type="${type}" id="${id}" name="${name ?? id}">${label}</button>` : 
        type === 'select' ? 
            `<select class="form-control" id="${id}" name="${name ?? id}" ${isRequired(required)}>
                ${options && options.map(opt => getFormControl(opt)).join('')}
            </select>` :
        type === 'option' ?
            `<option value="${id}" ${isRequired(required)}>${label}</option>` :
        type === `textarea` ?
            `<textarea class="form-control" id="${id}" name="${name ?? id}" ${isRequired(required)}></textarea>` :
        `<input class="form-control" type="${type ?? 'text'}" id="${id}" name="${name ?? id}" ${isRequired(required)} 
            ${Object.entries(props).map(([k,v]) => `${k}="${v}"`).join(' ')}
            />`
    const renderFormControl = (props) => `
        ${props.label && `<label for="${props.id}">${props.label}</label>`}
        ${getFormControl(props)}
    `
    const main = Object.assign(document.createElement('main'), {
        id: 'main',
        className: 'modal'
    });
    main.innerHTML = forms.map(form => renderForm(form)).join('');
    const navBar = document.createElement('nav', { id: 'nav-bar' });
    navBar.innerHTML= `
        <a href="#login">Iniciar Sesion</a>
        <a href="#signup">Registrarse</a>
    `
    root.append(navBar, main);
}