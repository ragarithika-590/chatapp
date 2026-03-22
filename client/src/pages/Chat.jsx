import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import MessageBubble from "../components/MessageBubble";

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null); // used to auto-scroll to bottom

  // Auto scroll to latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When user switches rooms
  useEffect(() => {
    if (!socket || !activeRoom) return;

    // Clear messages from previous room
    setMessages([]);

    // Join the new room
    socket.emit("join_room", { roomId: activeRoom.id, userId: user._id });

    // Receive message history when joining
    socket.on("message_history", (history) => {
      setMessages(history);
    });

    // Listen for new incoming messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup listeners when room changes or component unmounts
    // Without this, listeners stack up and you get duplicate messages
    return () => {
      socket.off("message_history");
      socket.off("receive_message");
      socket.emit("leave_room", { roomId: activeRoom.id, userId: user._id });
    };
  }, [socket, activeRoom]);

  const handleRoomChange = (room) => {
    setActiveRoom(room);
  };

  const handleSend = () => {
    if (!inputValue.trim() || !activeRoom || !socket) return;

    socket.emit("send_message", {
      roomId: activeRoom.id,
      senderId: user._id,
      content: inputValue.trim(),
    });

    setInputValue("");
  };

  // Send message on Enter key, new line on Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* Sidebar */}
      <Sidebar activeRoom={activeRoom} onRoomChange={handleRoomChange} />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {activeRoom ? (
          <>
            {/* Room header */}
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
              <h2 className="text-white font-semibold"># {activeRoom.name}</h2>
              <p className="text-gray-500 text-xs mt-0.5">{activeRoom.description}</p>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">No messages yet</p>
                    <p className="text-gray-700 text-xs mt-1">Be the first to say something!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message._id} message={message} />
                ))
              )}
              {/* Invisible div at bottom — we scroll to this */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 shrink-0">
              <div className="flex items-end gap-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message #${activeRoom.name}`}
                  rows={1}
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600 resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium shrink-0"
                >
                  Send
                </button>
              </div>
              <p className="text-gray-700 text-xs mt-2">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          /* No room selected state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">#</span>
              </div>
              <h3 className="text-white font-semibold">Pick a room</h3>
              <p className="text-gray-500 text-sm mt-1">
                Select a room from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;