import { config } from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Database, WebSocket } from "./config/index.js";
import { mainRouter } from './routes/main.router.js'
import type { Socket } from "socket.io";
import { msgHandler } from "./config/msg.handler.js";
import { tictactoeHandler } from "./sockets/tictactoe.handler.js";
config();
const db = new Database();
const app = express();
const server = createServer(app)
const ws = new WebSocket(server);
ws.connect((socket: Socket) => {
    msgHandler((WebSocket as any).ws, socket);
    tictactoeHandler((WebSocket as any).ws, socket);
})
app.use('/api/', mainRouter);
app.use(express.static('./public/'));
server.listen(process.env.PORT ?? 3000, () => {
    const { HOST, PORT } = process.env
    console.log(`service running on http://${HOST}:${PORT}`)
})
export {
    db,
    ws
}