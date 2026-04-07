import * as PIXI from "pixi.js";
import { socket } from "./useSocket";
import { createAvatar } from "../components/Avatar";

export const usePlayers = (
  app: PIXI.Application,
  players: Record<string, PIXI.Container>,
) => {
  socket.on("init", (allUsers: any) => {
    console.log("🔥 INIT USERS:", allUsers); // 👈 ADD THIS

    Object.entries(allUsers).forEach(([id, user]: any) => {
      console.log("👤 creating user:", id, user); // 👈 ADD

      if (players[id]) return;

      const avatar = createAvatar(
        id,
        id === socket.id,
        user.username,
        user.avatar,
      );

      avatar.x = user.x;
      avatar.y = user.y;

      app.stage.addChild(avatar);
      players[id] = avatar;
    });
  });

  socket.on("user-joined", (user: any) => {
    if (players[user.id]) return;

    const avatar = createAvatar(user.id, false, user.username);

    avatar.x = user.x;
    avatar.y = user.y;

    app.stage.addChild(avatar);
    players[user.id] = avatar;
  });

  socket.on("user-moved", ({ id, x, y }) => {
    if (players[id]) {
      players[id].x = x;
      players[id].y = y;
    }
  });

  socket.on("user-left", (id) => {
    if (players[id]) {
      app.stage.removeChild(players[id]);
      delete players[id];
    }
  });
};
