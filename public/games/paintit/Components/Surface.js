import { Canvas } from './Canvas.js';
export class Surface extends Canvas {
    get width() { return this.element.width; }
    get height() { return this.element.height; }
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }
    resize(width, height) {
        const snapshot = document.createElement('canvas');
        snapshot.width = this.width;
        snapshot.height = this.height;
        const hasSnapshot = snapshot.width > 0 && snapshot.height > 0;
        if (hasSnapshot) snapshot.getContext('2d').drawImage(this.element, 0, 0);
        this.element.width = Math.max(1, Math.floor(width));
        this.element.height = Math.max(1, Math.floor(height));
        if (hasSnapshot) this.ctx.drawImage(snapshot, 0, 0);
    }
}
