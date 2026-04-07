import { useState, useEffect } from "react";
import Canvas from "./components/Canvas";
import ChatPanel from "./components/ChatPanel";
import { socket } from "./hooks/useSocket";
import { useAuth } from "./hooks/useAuth";

function App() {
  useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<
    Record<string, { text: string; self: boolean }[]>
  >({});
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    socket.on("user-count", setUserCount);

    return () => {
      socket.off("user-count", setUserCount);
    };
  }, []);

  return (
    <>
      <div className="fixed top-3 left-3 bg-black/60 text-white px-3 py-1 rounded">
        👥 Users Online: {userCount}
      </div>
      <Canvas setActiveChat={setActiveChat} />

      {activeChat && (
        <ChatPanel
          roomId={activeChat}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
        />
      )}
    </>
  );
}

export default App;
