import type { Server, Socket } from 'socket.io';
type DrawPayload = { room?: string; phase?: string; shape?: string; coords?: Record<string, number> };
export const paintitHandler = (ws: Server, socket: Socket) => {
    socket.on('paintit:join', (payload: { room?: string } = {}) => {
        const room = payload.room?.trim();
        if (room) socket.join(room);
    });
    socket.on('paintit:draw', (payload: DrawPayload = {}) => {
        const room = payload.room?.trim();
        if (!room || !socket.rooms.has(room) || !payload.coords) return;
        socket.to(room).emit('paintit:draw', payload);
    });
};
