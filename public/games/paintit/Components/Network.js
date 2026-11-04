import { CanvasPaint } from './Canvas/CanvasPaint.js';
const ROOM = new URLSearchParams(location.search).get('room') ?? 'paintit';
const apply = (main, preview, data) => {
    if (data.phase === 'start' || (data.phase === 'move' && data.shape !== 'freeHand')) {
        return preview.configure(data).setCoords(data.coords).clear().draw({ fill: false });
    }
    if (data.phase === 'end') preview.clear();
    main.configure(data).setCoords(data.coords).draw({ fill: data.shape === 'freeHand' ? false : undefined });
};
export const connectPaint = (painter, canvas, preview) => {
    const socket = io();
    const main = new CanvasPaint(painter.element);
    const shadow = new CanvasPaint(preview);
    socket.emit('paintit:join', { room: ROOM });
    socket.on('paintit:draw', (data) => apply(main, shadow, data));
    const send = (phase) => socket.emit('paintit:draw', { room: ROOM, phase, shape: painter.shape, sides: painter.sides, lineWidth: painter.lineWidth, strokeStyle: painter.strokeStyle, fillStyle: painter.fillStyle, coords: { ...painter.coords } });
    canvas.addEventListener('mousedown', () => send('start'));
    window.addEventListener('mousemove', () => send('move'));
    window.addEventListener('mouseup', () => send('end'));
};
