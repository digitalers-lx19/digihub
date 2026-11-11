import { center, length } from './geometry.js';
const INNER_RATIO = 0.5;
export const star = ({ ctx, coords: { x1, y1, x2, y2 }, sides = 5 }) => {
    const total = Number(sides);
    if (!Number.isInteger(total) || total < 3) return;
    const cx = center(x1, x2);
    const cy = center(y1, y2);
    const outer = length(x1, y1, x2, y2) / 2;
    const inner = outer * INNER_RATIO;
    for (let i = 0; i < total * 2; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = -Math.PI / 2 + (i * Math.PI) / total;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
};
