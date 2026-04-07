import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  socketId: String,
  username: String,
  avatar: String,
  x: { type: Number, default: 300 },
  y: { type: Number, default: 300 },
  lastSeen: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);