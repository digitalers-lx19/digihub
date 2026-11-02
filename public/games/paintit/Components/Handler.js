import { resize } from "./Global.js";
import { Canvas, CanvasEventHandler } from "./Canvas/index.js";
export class Handler {
    bind() {
    const canvas = document.getElementById('canvas');
    const shadow = document.getElementById('shadow');
    const read = () => ({
        shape: document.getElementById('shape').value,
        lineWidth: Number(document.getElementById('strokeWidth').value),
        strokeStyle: document.getElementById('strokeStyle').value,
        fillStyle: document.getElementById('fillStyle').value,
    });
    const handler = new CanvasEventHandler(canvas, new Canvas(shadow));
    handler.configure(read());
    handler.preview.configure(read());
    ['shape', 'strokeWidth', 'strokeStyle', 'fillStyle'].forEach((id) => {
        document.getElementById(id).addEventListener('input', () => {
            const options = read();
            handler.configure(options);
            handler.preview.configure(options);
        });
    });
    window.addEventListener('resize', () => {
        const { width, height } = resize();
        handler.resize(width, height);
        handler.preview.resize(width, height);
    });
    }
}