import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", messageSchema);