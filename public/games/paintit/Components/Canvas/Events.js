import { Canvas } from './Canvas.js';
export class CanvasEventHandler extends Canvas {
    constructor(element, preview = null) {
        super(element);
        this.preview = preview;
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.bindEvents();
    }
    bindEvents() {
        this.element.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        return this;
    }
    destroy() {
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        return this;
    }
    getPoint(event) {
        const { left, top } = this.element.getBoundingClientRect();
        return {
            x: event.clientX - left,
            y: event.clientY - top,
        };
    }
    handleMouseDown(event) {
        if (event.button !== 0) return;
        event.preventDefault();
        this.isDrawing = true;
        const { x, y } = this.getPoint(event);
        this.setCoords({ x1: x, y1: y, x2: x, y2: y });
        this.preview?.clear();
    }
    handleMouseMove(event) {
        if (!this.isDrawing) return;
        const { x, y } = this.getPoint(event);
        if (this.shape === 'freeHand') {
            this.setCoords({
                x1: this.coords.x2,
                y1: this.coords.y2,
                x2: x,
                y2: y,
            });
            this.draw({ fill: false });
            return;
        }
        this.preview
            ?.configure(this.options)
            .setCoords({ x1: this.coords.x1, y1: this.coords.y1, x2: x, y2: y })
            .clear()
            .draw({ fill: false });
    }
    handleMouseUp(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        const { x, y } = this.getPoint(event);
        if (this.shape === 'freeHand') {
            this.setCoords({
                x1: this.coords.x2,
                y1: this.coords.y2,
                x2: x,
                y2: y,
            });
            this.draw({ fill: false });
        } else {
            this.setCoords({ x2: x, y2: y });
            this.draw();
        }
        this.preview?.clear();
    }
}