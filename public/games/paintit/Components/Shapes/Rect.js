import { diff } from "../Utils.js";
export function Rect({ ctx, coords }) {
    const { x1, y1, x2, y2 } = coords;
    const width = diff(x2, x1);
    const height = diff(y2, y1);
    ctx.rect(x1, y1, width, height);
}
