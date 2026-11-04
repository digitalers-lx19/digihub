import type { Server, Socket } from "socket.io";
import { SolitaireGame, type PileRef } from "../games/index.js";
type Entry = { game: SolitaireGame; owner: string };
const rooms = new Map<string, Entry>();
const roomOf = (payload: { room?: string }) => payload?.room?.trim() ?? "";
const sync = (ws: Server, room: string, entry: Entry) => {
    ws.to(room).emit("solitaire:update", entry.game.toJSON(room));
};
export const solitaireHandler = (ws: Server, socket: Socket) => {
    socket.on("solitaire:start", (payload: { room?: string; name?: string } = {}) => {
        const room = roomOf(payload);
        if (!room) return;
        const game = new SolitaireGame();
        game.start(socket.id, payload.name ?? "Jugador");
        rooms.set(room, { game, owner: socket.id });
        socket.join(room);
        socket.emit("solitaire:joined", { room, id: socket.id });
        sync(ws, room, rooms.get(room)!);
    });
    socket.on("solitaire:draw", (payload: { room?: string } = {}) => {
        const room = roomOf(payload);
        const entry = rooms.get(room);
        if (!entry || entry.owner !== socket.id) return;
        try {
            entry.game.draw(socket.id);
            sync(ws, room, entry);
        } catch (error) {
            socket.emit("solitaire:error", { message: (error as Error).message });
        }
    });
    socket.on("solitaire:move", (payload: { room?: string; from?: PileRef; to?: PileRef; cardId?: string } = {}) => {
        const room = roomOf(payload);
        const entry = rooms.get(room);
        if (!entry || entry.owner !== socket.id || !payload.from || !payload.to) return;
        try {
            entry.game.move(socket.id, payload.from, payload.to, payload.cardId);
            sync(ws, room, entry);
        } catch (error) {
            socket.emit("solitaire:error", { message: (error as Error).message });
            sync(ws, room, entry);
        }
    });
    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            const entry = rooms.get(room);
            if (entry?.owner === socket.id) rooms.delete(room);
        }
    });
};
