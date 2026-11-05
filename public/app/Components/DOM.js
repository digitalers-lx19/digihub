export class DOM {
    element = null;
    constructor(value) {
        typeof value === "string" && this.select(value);
        typeof value === "object" && this.create(value);
        this.element ?? this.create({});
        return this.element;
    }
    create({ tag = 'div', ...props }) {
        this.element = Object.assign(document.createElement(tag), props);
    }
    select(element) {
        this.element = document.querySelector(element);
    }
    get(key) {
        return this.element?.getAttribute(key);
    }
    set(key, value) {
        return this.element?.setAttribute(key, value);
    }
    delete() {
        return this.element?.remove();
    }
}