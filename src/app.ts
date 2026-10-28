import express from "express";
import { createServer } from "node:http";
import type { Socket } from "socket.io";
import { WebSocket } from "./config/index.js";
import * as Handlers from "./sockets/index.js";
import { mainRouter } from "./routes/main.router.js";
import { mainController } from "./controllers/main.controller.js";
export function App () {   
    const app = express();
    const server = createServer(app)
    const ws = new WebSocket(server);
    const socketHandlers = Object.values(Handlers).filter(h => typeof h === "function")
    ws.connect((socket: Socket) => {
        socketHandlers.map(handler => handler((WebSocket as any).ws, socket))
    }) 
app.get('/', mainController.getAppsPage);
app.use('/api/', mainRouter);
    app.use(express.static('./public/'));
    server.listen(process.env.PORT ?? 3000, () => {
        const { HOST, PORT } = process.env
        console.log(`service running on http://${HOST}:${PORT}`)
    })
}