import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Message } from "./models/Message";
import { User } from "./models/User";

export const createServer = () => {
  const app = express();
  app.use(cors());

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // 🔥 helper → active users only (last 10 sec)
  const getActiveUsers = async () => {
    return await User.find({
      lastSeen: { $gte: new Date(Date.now() - 10000) },
    });
  };

  // 🔥 emit user count
  const emitUserCount = async () => {
    const users = await getActiveUsers();
    io.emit("user-count", users.length);
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    let currentUserId: string | null = null;

    // ✅ REGISTER USER (FIXED)
    socket.on("register", async ({ userId, username, avatar }) => {
      currentUserId = userId;

      const existingUser = await User.findOne({ userId });

      const updatedUser = await User.findOneAndUpdate(
        { userId },
        {
          userId,
          socketId: socket.id,
          username,
          avatar,
          x: existingUser?.x ?? Math.random() * 800,
          y: existingUser?.y ?? Math.random() * 600,
          lastSeen: new Date(),
        },
        { upsert: true, new: true },
      );

      socket.broadcast.emit("user-joined", {
        id: userId, // ✅ FIXED
        x: updatedUser?.x,
        y: updatedUser?.y,
        username: updatedUser?.username,
        avatar: updatedUser?.avatar,
      });

      await emitUserCount();
    });

    // ✅ INIT USERS (FIXED)
    socket.on("ready", async () => {
      const users = await getActiveUsers();

      const formatted = Object.fromEntries(
        users.map((u) => [
          u.userId, // ✅ FIXED (not socketId)
          {
            x: u.x || 300,
            y: u.y || 300,
            username: u.username,
            avatar: u.avatar,
          },
        ]),
      );

      socket.emit("init", formatted);
    });

    // ✅ ROOMS + CHAT HISTORY
    socket.on("join-room", async (roomId) => {
      socket.join(roomId);

      const history = await Message.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50);

      socket.emit("chat-history", history);
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
    });

    // ✅ SEND MESSAGE
    socket.on("send-message", async ({ roomId, message }) => {
      if (!currentUserId) return;

      await Message.create({
        roomId,
        senderId: currentUserId,
        message,
      });

      io.to(roomId).emit("receive-message", {
        message,
        senderId: currentUserId,
      });
    });

    // ✅ MOVE
    socket.on("move", async (pos) => {
      if (!currentUserId) return;

      await User.updateOne(
        { userId: currentUserId },
        {
          x: pos.x,
          y: pos.y,
          lastSeen: new Date(),
        },
      );

      io.emit("user-moved", {
        id: currentUserId, // ✅ FIXED
        ...pos,
      });
    });

    // ✅ DISCONNECT
    socket.on("disconnect", async () => {
      if (currentUserId) {
        await User.updateOne(
          { userId: currentUserId },
          { lastSeen: new Date() },
        );

        socket.broadcast.emit("user-left", currentUserId); // ✅ FIXED
      }

      await emitUserCount();
    });
  });

  return server;
};
