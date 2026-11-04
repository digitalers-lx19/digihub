const center = (a, b) => (a + b) / 2;
const distance = (a, b) => Math.abs(b - a);
const length = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
export const line = ({ ctx, x1, y1, x2, y2 }) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
};
export const rect = ({ ctx, x1, y1, x2, y2 }) => {
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
};
export const circle = ({ ctx, x1, y1, x2, y2 }) => {
    ctx.arc(x1, y1, length(x1, y1, x2, y2), 0, 2 * Math.PI);
};
export const ellipse = ({ ctx, x1, y1, x2, y2 }) => {
    const radiusX = distance(x1, x2) / 2;
    const radiusY = distance(y1, y2) / 2;
    ctx.ellipse(center(x1, x2), center(y1, y2), radiusX, radiusY, 0, 0, 2 * Math.PI);
};
export { center, length };
