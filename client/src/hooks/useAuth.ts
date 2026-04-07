import { useEffect } from "react";
import { socket } from "./useSocket";

export const useAuth = () => {
  useEffect(() => {
    let userId = sessionStorage.getItem("userId"); // 🔥 changed
    let username = sessionStorage.getItem("username");
    let avatar = sessionStorage.getItem("avatar");

    if (!userId) {
      userId = crypto.randomUUID();
      sessionStorage.setItem("userId", userId);
    }

    if (!username) {
      username = prompt("Enter your name") || "Guest";
      sessionStorage.setItem("username", username);
    }

    if (!avatar) {
      avatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${userId}`;
      sessionStorage.setItem("avatar", avatar);
    }

    socket.emit("register", { userId, username, avatar });

    setTimeout(() => {
      socket.emit("ready");
    }, 200);
  }, []);
};