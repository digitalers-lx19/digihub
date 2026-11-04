import type { PublicMsg, PrivateMsg } from "../definitions/index.js";
import type { Server, Socket } from "socket.io";
export const chatRoom = "chat";
export const msgHandler = (ws: Server, socket: Socket) => {
    socket.join(chatRoom);
    socket.on("join", (room: string) => {
        if (typeof room === "string" && room !== chatRoom)
            socket.join(room);
    });
    socket.on("leave", (room: string) => {
        if (typeof room === "string" && room !== chatRoom)
            socket.leave(room);
    });
    socket.on("message:public", (msg: PublicMsg) => {
        const targetRoom = msg.room || chatRoom;
        ws.to(targetRoom).emit("message:public", msg);
    });
    socket.on("message:private", (msg: PrivateMsg) => {
        msg?.to && ws.to(msg.to).emit("message:private", msg);
    });
};