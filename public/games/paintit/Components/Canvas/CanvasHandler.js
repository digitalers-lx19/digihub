import { CanvasPaint } from './CanvasPaint.js';
import { point } from './point.js';
export class CanvasHandler extends CanvasPaint {
    constructor(element, preview) { super(element); this.preview = preview; }
    handleEvent(event) { this[event.type]?.(event); }
    mousedown(event) {
        if (event.button !== 0) return;
        event.preventDefault();
        this.isDrawing = true;
        const { x, y } = point(this.element, event);
        this.setCoords({ x1: x, y1: y, x2: x, y2: y });
        this.preview?.clear();
    }
    mousemove(event) {
        if (!this.isDrawing) return;
        const { x, y } = point(this.element, event);
        if (this.shape !== 'freeHand') return this.preview?.configure(this).setCoords({ x1: this.coords.x1, y1: this.coords.y1, x2: x, y2: y }).clear().draw({ fill: false });
        this.setCoords({ x1: this.coords.x2, y1: this.coords.y2, x2: x, y2: y }).draw({ fill: false });
    }
    mouseup(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        const { x, y } = point(this.element, event);
        if (this.shape === 'freeHand') this.setCoords({ x1: this.coords.x2, y1: this.coords.y2, x2: x, y2: y }).draw({ fill: false });
        else this.setCoords({ x2: x, y2: y }).draw();
        this.preview?.clear();
    }
}