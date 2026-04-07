import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { socket } from "./useSocket";

export const useMovement = (
  me: PIXI.Container | null,
  players: Record<string, PIXI.Container>,
  setActiveChat: (id: string | null) => void,
) => {
  const keysRef = useRef<Record<string, boolean>>({});
  const nearbyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!me) return;

    console.log("✅ movement hook mounted");

    const speed = 20; // 🔥 increased speed
    const PROXIMITY_RADIUS = 150;
    const ROOM_ID = "proximity-group";

    let isInRoom = false;

    const interval = setInterval(() => {
      const keys = keysRef.current;

      let moved = false;

      if (keys["arrowup"]) {
        me.y -= speed;
        moved = true;
      }
      if (keys["arrowdown"]) {
        me.y += speed;
        moved = true;
      }
      if (keys["arrowleft"]) {
        me.x -= speed;
        moved = true;
      }
      if (keys["arrowright"]) {
        me.x += speed;
        moved = true;
      }

      if (moved) {
        // console.log("📍 POS:", me.x, me.y); // 🔥 debug
        socket.emit("move", { x: me.x, y: me.y });
      }

      // 🔥 PROXIMITY
      const nearby = nearbyRef.current;
      nearby.clear();

      Object.entries(players).forEach(([id, other]) => {
        if (id === socket.id) return;

        const dx = me.x - other.x;
        const dy = me.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < PROXIMITY_RADIUS) {
          nearby.add(id);
        }
      });

      if (nearby.size > 0) {
        if (!isInRoom) {
          isInRoom = true;
          setActiveChat(ROOM_ID);
          socket.emit("join-room", ROOM_ID);
        }
      } else {
        if (isInRoom) {
          isInRoom = false;
          setActiveChat(null);
          socket.emit("leave-room", ROOM_ID);
        }
      }
    }, 16);

    // 🔥 KEY EVENTS (FINAL FIX)
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
          keysRef.current["arrowup"] = true;
          break;
        case "ArrowDown":
          keysRef.current["arrowdown"] = true;
          break;
        case "ArrowLeft":
          keysRef.current["arrowleft"] = true;
          break;
        case "ArrowRight":
          keysRef.current["arrowright"] = true;
          break;
      }
    };

    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
          keysRef.current["arrowup"] = false;
          break;
        case "ArrowDown":
          keysRef.current["arrowdown"] = false;
          break;
        case "ArrowLeft":
          keysRef.current["arrowleft"] = false;
          break;
        case "ArrowRight":
          keysRef.current["arrowright"] = false;
          break;
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [me]);
};