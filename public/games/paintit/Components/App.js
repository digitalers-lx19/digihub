import { View } from './View.js';
import { CanvasPaint } from './Canvas/CanvasPaint.js';
import { CanvasHandler } from './Canvas/CanvasHandler.js';
import { bindControls } from './Controls.js';
import { fitToWindow } from './Layout.js';
import { connectPaint } from './Network.js';
const connectEvents = (canvas, painter) => {
    canvas.addEventListener('mousedown', painter);
    window.addEventListener('mousemove', painter);
    window.addEventListener('mouseup', painter);
};
export const App = () => {
    const { canvas, preview, controls } = View();
    const painter = new CanvasHandler(canvas, new CanvasPaint(preview));
    bindControls(painter, controls);
    connectEvents(canvas, painter);
    connectPaint(painter, canvas, preview);
    const fit = () => fitToWindow(painter, painter.preview);
    window.addEventListener('resize', fit);
    fit();
};
