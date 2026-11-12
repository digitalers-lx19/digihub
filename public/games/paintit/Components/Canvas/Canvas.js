import { Shape } from '../Shape.js';
const OPTION_KEYS = ['shape', 'lineWidth', 'strokeStyle', 'fillStyle', 'sides'];
const COORD_KEYS = ['x1', 'y1', 'x2', 'y2'];
export class Canvas {
    isDrawing = false;
    shape = 'freeHand';
    lineWidth = 1;
    strokeStyle = '#000000';
    fillStyle = '#ffffff';
    sides = 5;
    coords = { x1: 0, y1: 0, x2: 0, y2: 0 };
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
    setCoords(coords = {}) {
        for (const key of COORD_KEYS) if (coords[key] !== undefined) 
            this.coords[key] = coords[key];
        return this;
    }
}