export function FreeHand({ ctx, coords }) {
    const { x1, y1, x2, y2 } = coords;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}