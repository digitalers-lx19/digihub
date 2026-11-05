import { center, length } from "../Utils.js";
export function Polygon({ ctx, coords, sides = 5 }) {
    const total = Number(sides);
    if (!Number.isInteger(total) || total < 3) return;
    const { x1, y1, x2, y2 } = coords;
    const cx = center(x1, x2);
    const cy = center(y1, y2);
    const rad = length(x1, y1, x2, y2) / 2;
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < total; i++) {
        const angle = startAngle + (i * 2 * Math.PI / total);
        const vx = cx + rad * Math.cos(angle);
        const vy = cy + rad * Math.sin(angle);
        i === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
    }
    ctx.closePath();
}