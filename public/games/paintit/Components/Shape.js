import * as shapeDrawers from './Shapes/index.js';
const DEFAULT_SHAPE = 'freeHand';
const normalizeName = (name) => name.charAt(0).toLowerCase() + name.slice(1);
const drawers = Object.create(null);
for (const [exportName, drawShape] of Object.entries(shapeDrawers))
    if (typeof drawShape === 'function')
        drawers[normalizeName(exportName)] = drawShape;
Object.freeze(drawers);
export class Shape {
    constructor(canvas) {
        this.canvas = canvas;
    }
    static get names() {
        return Object.keys(drawers).sort((a, b) => {
            if (a === DEFAULT_SHAPE) return -1;
            if (b === DEFAULT_SHAPE) return 1;
            return a.localeCompare(b);
        });
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