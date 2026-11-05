import { Shape } from '../Shape.js';

const FILLED_SHAPES = new Set(['rect', 'circle', 'ellipse', 'polygon']);
const OPTION_KEYS = ['shape', 'lineWidth', 'strokeStyle', 'fillStyle', 'sides'];

export class Canvas {
    isDrawing = false;
    shape = 'freeHand';
    lineWidth = 1;
    strokeStyle = '#000000';
    fillStyle = '#ffffff';
    sides = 5;
    coords = { x1: 0, y1: 0, x2: 0, y2: 0 };
    constructor(element) {
        if (!element || typeof element.getContext !== 'function')
            throw new TypeError('Canvas espera un elemento <canvas> válido');
        this.element = element;
        this.ctx = element.getContext('2d');
        this.shapeFactory = new Shape(this);
    }
    get width() { return this.element.width }
    get height() { return this.element.height }
    get options() { return {
        shape: this.shape,
        lineWidth: this.lineWidth,
        strokeStyle: this.strokeStyle,
        fillStyle: this.fillStyle,
        sides: this.sides,
    }}
    configure(options = {}) {
        OPTION_KEYS.forEach((key) => {
            if (options[key] !== undefined) this[key] = options[key];
        });
        this.lineWidth = Number(this.lineWidth);
        this.sides = Number(this.sides);
        return this;
    }
    setCoords(coords = {}) {
        this.coords = { ...this.coords, ...coords };
        return this;
    }
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }
    fill(color = this.fillStyle) {
        this.ctx.fillStyle = color;
        this.ctx.fill();
        return this;
    }
    stroke(style = this.strokeStyle, width = this.lineWidth) {
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = Number(width);
        this.ctx.stroke();
        return this;
    }
    draw({ fill = FILLED_SHAPES.has(this.shape), stroke = true } = {}) {
        if (!this.shapeFactory.has(this.shape)) return this;
        this.ctx.save();
        this.ctx.beginPath();
        this.shapeFactory.draw(this.shape);
        stroke && this.stroke();
        fill && this.fill();
        this.ctx.restore();
        return this;
    }
    resize(width, height) {
        const snapshot = document.createElement('canvas');
        snapshot.width = this.width;
        snapshot.height = this.height;
        if (snapshot.width > 0 && snapshot.height > 0)
            snapshot.getContext('2d').drawImage(this.element, 0, 0);
        this.element.width = Math.max(1, Math.floor(width));
        this.element.height = Math.max(1, Math.floor(height));
        if (snapshot.width > 0 && snapshot.height > 0)
            this.ctx.drawImage(snapshot, 0, 0);
        return this;
    }
}