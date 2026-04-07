import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { socket } from "../hooks/useSocket";
import { createAvatar } from "./Avatar";
import { usePlayers } from "../hooks/usePlayers";
import { useMovement } from "../hooks/useMovement";

export default function Canvas({ setActiveChat }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  const [me, setMe] = useState<PIXI.Container | null>(null);
  const playersRef = useRef<Record<string, PIXI.Container>>({});

  useEffect(() => {
    let app: PIXI.Application;

    const init = async () => {
      app = new PIXI.Application();

      await app.init({
        resizeTo: window,
        background: "#111",
      });

      appRef.current = app;
      containerRef.current!.appendChild(app.canvas);

      app.canvas.tabIndex = 0;
      app.canvas.focus();

      const players = playersRef.current;

      // 🔥 STEP 1: register first
      socket.emit("register", {
        userId: localStorage.getItem("userId"),
        username: "Kishan",
        avatar: "default",
      });

      // 🔥 STEP 2: wait for init
      socket.emit("ready");

      socket.on("init", (allPlayers) => {
        Object.entries(allPlayers).forEach(([id, data]: any) => {
          const player = createAvatar(
            id,
            id === localStorage.getItem("userId"),
          );

          player.x = data.x;
          player.y = data.y;

          app.stage.addChild(player);
          players[id] = player;

          if (id === localStorage.getItem("userId")) {
            setMe(player);
          }
        });
      });

      // 🔥 new user joins
      socket.on("user-joined", (user) => {
        const player = createAvatar(user.id, false);

        player.x = user.x;
        player.y = user.y;

        app.stage.addChild(player);
        players[user.id] = player;
      });

      // 🔥 movement sync
      socket.on("user-moved", ({ id, x, y }) => {
        const player = players[id];
        if (player) {
          player.x = x;
          player.y = y;
        }
      });

      // 🔥 remove player
      socket.on("user-left", (id) => {
        const player = players[id];
        if (player) {
          app.stage.removeChild(player);
          delete players[id];
        }
      });
    };

    init();

    return () => {
      socket.off();
      appRef.current?.destroy(true);
    };
  }, []);

  // ✅ movement hook
  useMovement(me, playersRef.current, setActiveChat);

  return <div ref={containerRef} />;
}
