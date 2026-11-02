import * as drawers from './Shapes/index.js';
export class Shape {
    constructor(canvas) {
        this.canvas = canvas;
    }
    static get names() {
        return Object.keys(drawers);
    }
    has(name) {
        return Object.hasOwn(drawers, name);
    }
    draw(name) {
        if (!this.has(name)) return false;
        drawers[name](this.canvas);
        return true;
    }
}