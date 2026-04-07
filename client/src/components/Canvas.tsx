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

    // 🔥 focus fix only
    app.canvas.tabIndex = 0;
    app.canvas.focus();

    const players = playersRef.current;

    const myPlayer = createAvatar(socket.id!, true);

    myPlayer.x = window.innerWidth / 2;
    myPlayer.y = window.innerHeight / 2;

    app.stage.addChild(myPlayer);
    players[socket.id!] = myPlayer;

    setMe(myPlayer);

    usePlayers(app, players);
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