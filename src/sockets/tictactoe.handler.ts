import type { Server, Socket } from "socket.io";
import type { TicTacToeRoomState } from "../definitions/index.js";
const rooms = new Map<string, TicTacToeRoomState>();
const createRoom = (room: string) => {
    if (!rooms.has(room)) rooms.set(room, {
        players: [],
        board: Array(9).fill(null),
        turn: "X",
        winner: null,
        draw: false
    });
    return rooms.get(room)!;
};
const checkWin = (board: (string | null)[]) => {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a,b,c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) 
            return board[a];
    }
    return null;
};
export const tictactoeHandler = (ws: Server, socket: Socket) => {
    socket.on("tictactoe:create", (payload: { room: string }) => {
        if (!payload?.room) return;
        const room = payload.room;
        createRoom(room);
        socket.join(room);
        socket.emit("tictactoe:created", { room });
        ws.to(room).emit("tictactoe:room:update", rooms.get(room));
    });
    socket.on("tictactoe:join", (payload: { room: string }) => {
        if (!payload?.room) return;
        const room = payload.room;
        const state = createRoom(room);
        if (state.players.length >= 2) {
            socket.join(room);
            socket.emit("tictactoe:joined", { room, role: "observer" });
            ws.to(room).emit("tictactoe:room:update", state);
            return;
        }
        const symbol = state.players.length === 0 ? "X" : "O";
        state.players.push({ id: socket.id, symbol });
        socket.join(room);
        socket.emit("tictactoe:joined", { room, role: "player", symbol });
        ws.to(room).emit("tictactoe:room:update", state);
    });
    socket.on("tictactoe:move", (payload: { room: string, index: number }) => {
        if (!payload?.room || typeof payload.index !== "number") return;
        const room = payload.room;
        const state = rooms.get(room);
        if (!state || state.winner || state.draw) return;
        const player = state.players.find(p => p.id === socket.id);
        if (!player || player.symbol !== state.turn) return;
        if (state.board[payload.index] !== null) return;
        state.board[payload.index] = player.symbol;
        const win = checkWin(state.board);
        if (win) {
            state.winner = win;
            ws.to(room).emit("tictactoe:room:update", state);
            return;
        }
        const full = state.board.every(cell => cell !== null);
        if (full) {
            state.draw = true;
            ws.to(room).emit("tictactoe:room:update", state);
            return;
        }
        state.turn = state.turn === "X" ? "O" : "X";
        ws.to(room).emit("tictactoe:room:update", state);
    });
    socket.on("tictactoe:restart", (payload: { room: string }) => {
        if (!payload?.room) return;
        const room = payload.room;
        const state = rooms.get(room);
        if (!state) return;
        if (state.players.length < 2) return;
        state.board = Array(9).fill(null);
        state.winner = null;
        state.draw = false;
        state.turn = "X";
        ws.to(room).emit("tictactoe:room:update", state);
    });
    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            if (room === socket.id) continue;
            const state = rooms.get(room);
            if (!state) continue;
            const before = state.players.length;
            state.players = state.players.filter(p => p.id !== socket.id);
            if (state.players.length !== before) {
                ws.to(room).emit("tictactoe:room:update", state);
                if (state.players.length === 0) {
                    rooms.delete(room);
                }
            }
        }
    });
};