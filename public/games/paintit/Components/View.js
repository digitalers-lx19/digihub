import { DrawContext, shapes, resize } from './Global.js';
export class View {
    render() {
    const root = document.getElementById('root');
    const create = ({tag, ...props}) => Object.assign(document.createElement(tag), props);
    const container = create({
        tag: 'section',
        id: 'container',
        className: 'p-2 d-flex justify-content-between',
    })
    root.append(container);
    const shape = create({
        tag: 'select',
        id: 'shape',
        innerHTML: Object.keys(shapes).map(opt => 
            `<option value="${opt}">${opt}</option>`
        ).join(),
        oninput: ({target: {value}}) => DrawContext.shape = value
    });
    const strokeWidth = create({
        tag: 'input', 
        id: 'strokeWidth',
        type: 'range', 
        value:1, 
        min: 0, 
        max: 10,
        oninput: ({target: { value}}) => DrawContext.strokeWidth = value
    });
    const strokeStyle = create({
        tag: 'input', 
        id: 'strokeStyle',
        type: 'color',
        title: "color de linea",
        oninput: ({target: { value}}) => DrawContext.strokeStyle = value
    });
    const fillStyle = create({
        tag: 'input', 
        id: 'fillStyle',
        type: 'color',
        title: "color de relleno",
        oninput: ({target: { value}}) => DrawContext.fillStyle = value
    });
    // Lienzos
    const canvas = create({
        tag: 'canvas',
        id: 'canvas',
        className: 'border',
        height: resize().height,
        width: resize().width,
    })
    const shadowCanvas = create({
        tag: 'canvas',
        id: 'shadow',
        className: 'border',
        height: canvas.height,
        width: canvas.width,
    })
    const shapeLabel = create({tag: 'label'});
    shapeLabel.append(shape);
    const strokeLabel = create({tag: 'label'});
    strokeLabel.append(strokeStyle);
    const widthLabel = create({tag: 'label'});
    widthLabel.append(strokeWidth);
    const fillLabel = create({tag: 'label'});
    fillLabel.append(fillStyle);
    container.append(shapeLabel, strokeLabel, widthLabel, fillLabel);
    container.append(canvas, shadowCanvas);
    
    shadowCanvas.style.position = "absolute";
    shadowCanvas.style.top = '0';
    shadowCanvas.style.left = '0';
    shadowCanvas.style.zIndex = "2";
    }
}