import { length } from './geometry.js';
export const circle = ({ ctx, coords: { x1, y1, x2, y2 } }) => {
    const radius = length(x1, y1, x2, y2);
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
}