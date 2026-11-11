export const line = ({ ctx, coords: { x1, y1, x2, y2 } }) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
};
