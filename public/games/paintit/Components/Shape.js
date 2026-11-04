import { line, rect, circle, ellipse } from './Shapes.js';
import { polygon } from './Polygon.js';
const DEFAULT_SHAPE = 'freeHand';
const DRAWERS = new Map([
    ['freeHand', { draw: line, fill: false }],
    ['line', { draw: line, fill: false }],
    ['rect', { draw: rect, fill: true }],
    ['circle', { draw: circle, fill: true }],
    ['ellipse', { draw: ellipse, fill: true }],
    ['polygon', { draw: polygon, fill: true }],
]);
export class Shape {
    constructor(canvas) { this.canvas = canvas; }
    static get names() {
        return [...DRAWERS.keys()].sort((a, b) => a === DEFAULT_SHAPE ? -1 : b === DEFAULT_SHAPE ? 1 : a.localeCompare(b));
    }
    has(name) { return DRAWERS.has(name); }
    fills(name) { return DRAWERS.get(name)?.fill ?? false; }
    draw(name) {
        const drawer = DRAWERS.get(name);
        if (!drawer) return false;
        drawer.draw(this.canvas);
        return true;
    }
}
