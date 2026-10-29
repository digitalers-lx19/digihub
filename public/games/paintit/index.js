const DrawContext = {
    isDrawing: false,
    x1: 0, y1: 0,
    x2: 0, y2: 0,
    shape: 'freeHand',
    fillStyle: "transparent",
    strokeStyle: "#000",
    lineWidth: 1,    
}
document.addEventListener('DOMContentLoaded', () => {
    // Manipulacion del DOM
    const shape = create({
        tag: 'select', 
        oninput: ({target: {value}}) => DrawContext.shape = value
    });
    const shapeOptions = [
        'freeHand',
        'line',
        'rect',
        'circle',
        'ellipse',
        'polygon',
    ]
    shapeOptions.forEach(opt => shape.innerHTML += `<option value="${opt}">${opt}</option>`)
    const strokeWidth = create({
        tag: 'input', 
        type: 'range', 
        value:1, 
        min: 0, 
        max: 10,
        oninput: ({target: { value}}) => DrawContext.strokeWidth = value
    });
    const strokeStyle = create({
        tag: 'input', 
        type: 'color',
        title: "color de linea",
        oninput: ({target: { value}}) => DrawContext.strokeStyle = value
    });
    const fillStyle = create({
        tag: 'input', 
        type: 'color',
        title: "color de relleno",
        oninput: ({target: { value}}) => DrawContext.fillStyle = value
    });
    const childrens = [shape, strokeStyle, strokeWidth, fillStyle];
    const container = create({
        tag: 'section',
        className: 'p-2 d-flex justify-content-between',
        id: 'container',
    })
    childrens.forEach(c => container.appendChild(c));
    const canvas = create({
        tag: 'canvas',
        className: 'border',
        height: resize().height,
        width: resize().width,
    })
    root.append(container, canvas);
    // Eventos del navegador
    window.addEventListener('resize', () => {
        ctx.save();
        canvas.width = resize().width
        canvas.heigh = resize().height
        ctx.restore();
    })
    const resize = () => ({
        height: window.innerHeight - (container.getBoundingClientRect().bottom + 54), 
        width: window.innerWidth - 22,
    })
    // Lienzo y Figuras
    const ctx = canvas.getContext('2d');
    const shapes =  {
        freeHand: () => {
            const {x1,x2,y1,y2} = DrawContext
            ctx.lineWidth = DrawContext.lineWidth;
            ctx.strokeStyle = DrawContext.strokeStyle;
            ctx.closePath()
            ctx.stroke()
        },
        line: () => {
            const {x1,x2,y1,y2} = DrawContext
            ctx.beginPath();
            ctx.lineWidth = DrawContext.lineWidth;
            ctx.strokeStyle = DrawContext.strokeStyle;
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.stroke();
            ctx.closePath();
        },
        rect: () => {
            const {x1,x2,y1,y2} = DrawContext
            ctx.beginPath()
            ctx.fillStyle = DrawContext.fillStyle;
            ctx.strokeStyle = DrawContext.strokeStyle;
            ctx.lineWidth = DrawContext.strokeWidth;
            ctx.rect(x1, y1, x2 - x1, y2 - y1);
            ctx.stroke();
            ctx.closePath();
        },
        circle: () => {
            const {x1,y1,x2,y2} = DrawContext;
            ctx.fillStyle = DrawContext.fillStyle;
            ctx.strokeStyle = DrawContext.strokeStyle;
            ctx.strokeWidth = DrawContext.strokeWidth;
            ctx.beginPath();
            const cath = (a,b) => Math.pow(b - a, 2);
            const rad = Math.sqrt(cath(x1,x2) + cath(y1,y2));
            ctx.arc(x1, y1, rad, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        },
        ellipse: () => {
            const {x1,y1,x2,y2} = DrawContext;
            ctx.fillStyle = DrawContext.fillStyle;
            ctx.strokeStyle = DrawContext.strokeStyle;
            ctx.strokeWidth = DrawContext.strokeWidth;
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
        polygon: () => {

        }
    }
    // Eventos de Dibujo
    const drawEvents = ['mousedown', 'mousemove', 'mouseup']
    canvas.addEventListener('mousedown', () => DrawContext.isDrawing = true)
    canvas.addEventListener('mouseup', () => DrawContext.isDrawing = false)
    // Manejadores de Contexto
    drawEvents.map (event => 
        canvas.addEventListener(event, (ev) => {
            const getX = ({x}) => x - canvas.getBoundingClientRect().x
            const getY = ({y}) => y - canvas.getBoundingClientRect().y
            if (ev.type === "mousedown") {
                DrawContext.x1 = getX(ev);
                DrawContext.y1 = getY(ev);
            }
            if ((ev.type === "mousemove" && DrawContext.shape === "freeHand") || 
                (ev.type === "mouseup")) {
                const {shape:k} = DrawContext
                DrawContext.x2 = getX(ev);
                DrawContext.y2 = getY(ev);
                shapes[k]();
            }
        })
    )
})