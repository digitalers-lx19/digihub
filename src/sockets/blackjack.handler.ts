import type { Server, Socket } from "socket.io";
import { BlackjackGame } from "../games/index.js";
const rooms = new Map<string, BlackjackGame>();
const roomOf = (payload: { room?: string }) => payload?.room?.trim() ?? "";
const sync = (ws: Server, room: string, game: BlackjackGame) => {
    ws.to(room).emit("blackjack:update", game.toJSON(undefined, room));
};
export const blackjackHandler = (ws: Server, socket: Socket) => {
    socket.on("blackjack:join", (payload: { room?: string; name?: string } = {}) => {
        const room = roomOf(payload);
        if (!room) return;
        const game = rooms.get(room) ?? new BlackjackGame();
        rooms.set(room, game);
        try {
            game.addPlayer(socket.id, payload.name ?? "Jugador");
        } catch (error) {
            socket.emit("blackjack:error", { message: (error as Error).message });
            return;
        }
        socket.join(room);
        socket.emit("blackjack:joined", { room, id: socket.id });
        sync(ws, room, game);
    });
    socket.on("blackjack:start", (payload: { room?: string } = {}) => {
        const room = roomOf(payload);
        const game = rooms.get(room);
        if (!game || !socket.rooms.has(room)) return;
        try {
            game.start();
            sync(ws, room, game);
        } catch (error) {
            socket.emit("blackjack:error", { message: (error as Error).message });
        }
    });
    socket.on("blackjack:hit", (payload: { room?: string } = {}) => {
        const room = roomOf(payload);
        const game = rooms.get(room);
        if (!game) return;
        try {
            game.hit(socket.id);
            sync(ws, room, game);
        } catch (error) {
            socket.emit("blackjack:error", { message: (error as Error).message });
        }
    });
    socket.on("blackjack:stand", (payload: { room?: string } = {}) => {
        const room = roomOf(payload);
        const game = rooms.get(room);
        if (!game) return;
        try {
            game.stand(socket.id);
            sync(ws, room, game);
        } catch (error) {
            socket.emit("blackjack:error", { message: (error as Error).message });
        }
    });
    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            const game = rooms.get(room);
            if (!game) continue;
            game.removePlayer(socket.id);
            if (!game.players.length) rooms.delete(room);
            else sync(ws, room, game);
        }
    });
};
