import { Surface } from './Surface.js';
export class CanvasPaint extends Surface {
    fill(color = this.fillStyle) {
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    stroke(style = this.strokeStyle, width = this.lineWidth) {
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = Number(width);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }
    draw({ fill = this.shapeFactory.fills(this.shape), stroke = true } = {}) {
        if (!this.shapeFactory.has(this.shape)) return this;
        this.ctx.save();
        this.ctx.beginPath();
        this.shapeFactory.draw(this.shape);
        if (fill) this.fill();
        if (stroke) this.stroke();
        this.ctx.restore();
        return this;
    }
}
