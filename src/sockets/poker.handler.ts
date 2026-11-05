import type { Server, Socket } from "socket.io";
import { PokerGame, type PokerAction } from "../games/index.js";
import type { PokerRoomState } from "../definitions/index.js";
const rooms = new Map<string, PokerGame>();
const roomOf = (payload: { room?: string }) => payload?.room?.trim() ?? "";
const sync = (ws: Server, room: string, game: PokerGame) => {
    for (const player of game.players) {
        ws.to(player.id).emit("poker:update", game.toJSON(player.id, room));
    }
};
const snapshot = (game: PokerGame, room: string, viewer?: string): PokerRoomState => game.toJSON(viewer, room);
export const pokerHandler = (ws: Server, socket: Socket) => {
    socket.on("poker:join", (payload: { room?: string; name?: string } = {}) => {
        const room = roomOf(payload);
        if (!room) return;
        const game = rooms.get(room) ?? new PokerGame();
        rooms.set(room, game);
        try {
            game.addPlayer(socket.id, payload.name ?? "Jugador");
        } catch (error) {
            socket.emit("poker:error", { message: (error as Error).message });
            return;
        }
        socket.join(room);
        socket.emit("poker:joined", { room, id: socket.id });
        sync(ws, room, game);
    });
    socket.on("poker:start", (payload: { room?: string } = {}) => {
        const room = roomOf(payload);
        const game = rooms.get(room);
        if (!game || !socket.rooms.has(room)) return;
        try {
            game.start();
            sync(ws, room, game);
        } catch (error) {
            socket.emit("poker:error", { message: (error as Error).message });
        }
    });
    socket.on("poker:action", (payload: { room?: string; action?: PokerAction; amount?: number } = {}) => {
        const room = roomOf(payload);
        const game = rooms.get(room);
        if (!game || !payload.action) return;
        try {
            game.act(socket.id, payload.action, payload.amount ?? 0);
            sync(ws, room, game);
        } catch (error) {
            socket.emit("poker:error", { message: (error as Error).message });
            sync(ws, room, game);
        }
    });
    socket.on("poker:state", (payload: { room?: string } = {}) => {
        const room = roomOf(payload);
        const game = rooms.get(room);
        if (game) socket.emit("poker:update", snapshot(game, room, socket.id));
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
