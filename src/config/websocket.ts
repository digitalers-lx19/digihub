import type { Server as HTTPServer } from "node:http";
import { Server, Socket } from "socket.io";
export type SocketEvent = {
    name: string,
    data: Object
}
export class WebSocket {
    private ws: Server;
    constructor(httpServer: HTTPServer) {
        this.ws = new Server(httpServer);
    }
    connect(callback:Function) {
        this.ws.on("connection", (socket) => callback(socket));
    }
    emit(event:SocketEvent) {
        this.ws.emit(event.name, event.data);
    }
}