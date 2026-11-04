import { length } from "../Utils.js";
export function Circle({ ctx, coords }) {
    const { x1, y1, x2, y2 } = coords;
    const rad = length(x1, y1, x2, y2);
    ctx.arc(x1, y1, rad, 0, 2 * Math.PI);
}