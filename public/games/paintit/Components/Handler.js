import { DrawContext, shapes, resize } from "./Global.js";
export class Handler {
    bind() {
    const ctx = canvas.getContext('2d');
    const btx = shadow.getContext('2d');
    window.addEventListener('resize', () => {
        ctx.save();
        canvas.width = resize().width
        canvas.heigh = resize().height
        ctx.restore();
    })
    const drawEvents = ['mousedown', 'mousemove', 'mouseup']
    canvas.addEventListener('mousedown', () => DrawContext.isDrawing = true);
    canvas.addEventListener('mouseup', () => DrawContext.isDrawing = false);
    drawEvents.map (event => 
        canvas.addEventListener(event, (ev) => {
            const getX = ({x}) => x - canvas.getBoundingClientRect().x
            const getY = ({y}) => y - canvas.getBoundingClientRect().y
            if (ev.type === "mousedown") {
                DrawContext.x1 = getX(ev);
                DrawContext.y1 = getY(ev);
            }
            if (ev.type === "mousemove" && DrawContext.isDrawing) {
                btx.clearRect(0, 0, shadow.width, shadow.height);
                const {shape:k} = DrawContext
                DrawContext.x2 = getX(ev);
                DrawContext.y2 = getY(ev);
                const draw = shapes[k]
                if (typeof draw === 'function') draw(btx);
            }
            if ((ev.type === "mousemove" && DrawContext.shape === "freeHand" && DrawContext.isDrawing) || 
                (ev.type === "mouseup")) {
                const {shape:k} = DrawContext
                DrawContext.x2 = getX(ev);
                DrawContext.y2 = getY(ev);
                const draw = shapes[k]
                if (typeof draw === 'function') draw(ctx);
            }
        })
    )
    }
}