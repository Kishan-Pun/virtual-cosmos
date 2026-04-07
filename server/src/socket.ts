// socket.ts
import { Server } from "socket.io";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // move all socket logic here later if needed
  });
};