import { useState, useEffect, useRef } from "react";
import { socket } from "../hooks/useSocket";

type Message = {
  text: string;
  self: boolean;
  senderId?: string;
};

type ChatHistory = Record<string, Message[]>;

export default function ChatPanel({
  roomId,
  chatHistory,
  setChatHistory,
}: {
  roomId: string;
  chatHistory: ChatHistory;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>;
}) {
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ GET messages from global state
  const messages = chatHistory[roomId] || [];

  // ✅ RECEIVE MESSAGE
  useEffect(() => {
    // 🔥 RECEIVE LIVE MESSAGE
    const messageHandler = ({
      message,
      senderId,
    }: {
      message: string;
      senderId: string;
    }) => {
    //   if (senderId === socket.id) return;

      setChatHistory((prev) => ({
        ...prev,
        [roomId]: [
          ...(prev[roomId] || []),
          { text: message, self: false, senderId },
        ],
      }));
    };

    // 🔥 RECEIVE CHAT HISTORY (FROM MONGODB)
    const historyHandler = (history: any[]) => {
      setChatHistory((prev) => {
        if (prev[roomId]?.length) return prev; // 🔥 prevent overwrite

        const formatted = history.map((msg: any) => ({
          text: msg.message,
          self: msg.senderId === socket.id,
          senderId: msg.senderId,
        }));

        return {
          ...prev,
          [roomId]: formatted,
        };
      });
    };

    socket.on("receive-message", messageHandler);
    socket.on("chat-history", historyHandler);

    return () => {
      socket.off("receive-message", messageHandler);
      socket.off("chat-history", historyHandler);
    };
  }, [roomId, setChatHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND MESSAGE
  const sendMessage = () => {
    if (!message) return;

    socket.emit("send-message", {
      roomId,
      message,
    });

    // update global state
    // setChatHistory((prev) => ({
    //   ...prev,
    //   [roomId]: [...(prev[roomId] || []), { text: message, self: true }],
    // }));

    setMessage("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-72 bg-white/90 backdrop-blur p-3 rounded-xl shadow-xl z-50 border">
      {/* Messages */}
      <div className="h-48 overflow-y-auto mb-2 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-lg max-w-[80%] ${
              m.self
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            {!m.self && (
              <div className="text-xs opacity-70">
                User-{m.senderId?.slice(0, 4)}
              </div>
            )}
            {m.text}
          </div>
        ))}

        {/* AUTO SCROLL TARGET */}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 outline-none"
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button
          className="bg-blue-500 text-white px-3 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
