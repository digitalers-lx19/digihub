import { center, distance } from './geometry.js';
export const ellipse = ({ ctx, coords: { x1, y1, x2, y2 } }) => {
    const cx = center(x1, x2);
    const cy = center(y1, y2);
    const rx = distance(x1, x2) / 2;
    const ry = distance(y1, y2) / 2;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
};
