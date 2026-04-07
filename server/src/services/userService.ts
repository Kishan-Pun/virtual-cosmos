import { User } from "../models/User";

// ➕ add user
export const addUser = async (socketId: string) => {
  return await User.findOneAndUpdate(
    { socketId },
    {
      socketId,
      username: "User-" + socketId.slice(0, 4),
      x: 300,
      y: 300,
      lastSeen: new Date(),
    },
    { upsert: true, new: true }
  );
};

// 🔄 update position
export const updateUser = async (socketId: string, pos: any) => {
  return await User.updateOne(
    { socketId },
    {
      x: pos.x,
      y: pos.y,
      lastSeen: new Date(),
    }
  );
};

// ❌ remove (or mark offline)
export const removeUser = async (socketId: string) => {
  return await User.updateOne(
    { socketId },
    { lastSeen: new Date() }
  );
};

// 📦 get all users
export const getUsers = async () => {
  const users = await User.find();

  return Object.fromEntries(
    users.map((u) => [
      u.socketId,
      { x: u.x, y: u.y, username: u.username },
    ])
  );
};