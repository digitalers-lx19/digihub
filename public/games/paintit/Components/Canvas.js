import { Shape } from './Shape.js';
const OPTION_KEYS = ['shape', 'lineWidth', 'strokeStyle', 'fillStyle', 'sides'];
export class Canvas {
    isDrawing = false;
    shape = 'freeHand';
    lineWidth = 1;
    strokeStyle = '#000000';
    fillStyle = '#ffffff';
    sides = 5;
    x1 = 0; y1 = 0; x2 = 0; y2 = 0;
    constructor(element) {
        if (!element || typeof element.getContext !== 'function') throw new TypeError('Canvas espera un <canvas>');
        this.element = element;
        this.ctx = element.getContext('2d');
        this.shapeFactory = new Shape(this);
    }
    configure(options = {}) {
        for (const key of OPTION_KEYS) if (options[key] !== undefined) this[key] = options[key];
        this.lineWidth = Number(this.lineWidth);
        this.sides = Number(this.sides);
        return this;
    }
    setCoords({ x1, y1, x2, y2 } = {}) {
        if (x1 !== undefined) this.x1 = x1;
        if (y1 !== undefined) this.y1 = y1;
        if (x2 !== undefined) this.x2 = x2;
        if (y2 !== undefined) this.y2 = y2;
        return this;
    }
}
