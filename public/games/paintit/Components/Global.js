export const DrawContext = {
    isDrawing: false,
    x1: 0, y1: 0,
    x2: 0, y2: 0,
    shape: 'freeHand',
    fillStyle: "transparent",
    strokeStyle: "#000",
    lineWidth: 1,    
}
export const shapes =  {
    freeHand: (ctx) => {
        const {x1,x2,y1,y2} = DrawContext
        ctx.lineWidth = DrawContext.lineWidth;
        ctx.strokeStyle = DrawContext.strokeStyle;
        ctx.stroke()
        ctx.moveTo(x2 - 2, y2 - 2);
        ctx.lineTo(x2, y2);
    },
    line: (ctx) => {
        const {x1,x2,y1,y2} = DrawContext
        ctx.beginPath();
        ctx.lineWidth = DrawContext.lineWidth;
        ctx.strokeStyle = DrawContext.strokeStyle;
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
        ctx.closePath();
    },
    rect: (ctx) => {
        const {x1,x2,y1,y2} = DrawContext
        ctx.beginPath()
        ctx.fillStyle = DrawContext.fillStyle;
        ctx.strokeStyle = DrawContext.strokeStyle;
        ctx.lineWidth = DrawContext.lineWidth;
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    },
    circle: (ctx) => {
        const {x1,y1,x2,y2} = DrawContext;
        ctx.fillStyle = DrawContext.fillStyle;
        ctx.strokeStyle = DrawContext.strokeStyle;
        ctx.lineWidth = DrawContext.lineWidth;
        ctx.beginPath();
        const cath = (a,b) => Math.pow(b - a, 2);
        const rad = Math.sqrt(cath(x1,x2) + cath(y1,y2));
        ctx.arc(x1, y1, rad, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    },
    ellipse: (ctx) => {
        const {x1,y1,x2,y2} = DrawContext;
        ctx.fillStyle = DrawContext.fillStyle;
        ctx.strokeStyle = DrawContext.strokeStyle;
        ctx.lineWidth = DrawContext.lineWidth;
        ctx.beginPath();
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        const centerX = x1 + (x2 - x1) / 2;
        const centerY = y1 + (y2 - y1) / 2;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    },
    polygon: (ctx) => {

    },
    star: (ctx) => {

    }
}
export const resize = () => {
    const container = document.getElementById('container');
    if (container == null) return;
    return {
        height: window.innerHeight - container.getBoundingClientRect().bottom + 54, 
        width: window.innerWidth - 22,
    }}