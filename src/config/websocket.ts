import type { Server as HTTPServer } from "node:http";
import { Server, Socket } from "socket.io";
export class WebSocket {
    private static ws: Server;
    constructor(httpServer: HTTPServer) {
        WebSocket.ws = new Server(httpServer);
    }
    connect(callback: (socket: Socket) => void) {
        WebSocket.ws.on("connection", callback);
    }
    emit(name: string, data: unknown = {}) {
        WebSocket.ws.emit(name, data);
    }
}