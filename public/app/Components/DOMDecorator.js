import { DOM } from "./DOM.js";

export class DOMDecorator extends DOM {
    constructor(props) {
        super(props);
    }
    check(className){
        this.element.classList.contains(className)
    }
    push(className) {
        this.element?.classList.add(className);
    }
    toggle(a,b) {
        this.element?.classList.replace(a,b);
    }
    pop(className) {
        this.element?.classList.remove(className);
    }
}