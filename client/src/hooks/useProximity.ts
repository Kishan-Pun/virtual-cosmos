import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { socket } from "./useSocket";

export const useProximity = (
  me: PIXI.Container | null,
  players: Record<string, PIXI.Container>,
  setActiveChat: (id: string | null) => void
) => {
  const nearbyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!me) return;

    const PROXIMITY_RADIUS = 150;
    const ROOM_ID = "proximity-group";

    let isInRoom = false;

    const interval = setInterval(() => {
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
    }, 100);

    return () => clearInterval(interval);
  }, [me, players]);
};