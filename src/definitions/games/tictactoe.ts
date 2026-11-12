import type { Object } from "../index.js";
export interface Player {
    id: string;
    username?: string;
    symbol?: "X" | "O";
}
export interface RoomState extends Object{
    players: Player[];
}
export interface TicTacToeRoomState extends RoomState {
    players: { id: string; symbol: "X" | "O" }[];
    board: (string | null)[];
    turn: "X" | "O";
    winner: string | null;
    draw: boolean;
}