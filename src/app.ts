import express from "express";
import { createServer } from "node:http";
import type { Socket } from "socket.io";
import { WebSocket } from "./config/index.js";
import * as Handlers from "./sockets/index.js";
import { mainRouter } from "./routes/index.js";
import cors from "cors";
export function App () {   
    const app = express();
    const server = createServer(app)
    const ws = new WebSocket(server);
    const socketHandlers = Object.values(Handlers).filter(h => typeof h === "function")
    ws.connect((socket: Socket) => {
        socketHandlers.map(handler => handler((WebSocket as any).ws, socket))
    }) 
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/', mainRouter);
    app.use(express.static('./public/'));
    app.use(cors())
    server.listen(process.env.PORT ?? 3000, () => {
        const { HOST, PORT } = process.env
        console.log(`service running on http://${HOST}:${PORT}`)
    })
}