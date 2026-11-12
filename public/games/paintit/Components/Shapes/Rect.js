export const rect = ({ ctx, coords: { x1, y1, x2, y2 } }) => {
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.rect(x1, y1, width, height);
}