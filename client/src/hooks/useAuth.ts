import { useEffect } from "react";
import { socket } from "./useSocket";

export const useAuth = () => {
  useEffect(() => {
    let userId = localStorage.getItem("userId");
    let username = localStorage.getItem("username");
    let avatar = localStorage.getItem("avatar");

    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("userId", userId);
    }

    if (!username) {
      username = prompt("Enter your name") || "Guest";
      localStorage.setItem("username", username);
    }

    if (!avatar) {
      avatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${userId}`;
      localStorage.setItem("avatar", avatar);
    }

    // ✅ STEP 1
    socket.emit("register", { userId, username, avatar });

    // ✅ STEP 2 (IMPORTANT DELAY)
    setTimeout(() => {
      socket.emit("ready");
    }, 300);

  }, []);
};