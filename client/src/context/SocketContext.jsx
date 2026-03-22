import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      // If user logs out, disconnect the socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Create socket connection when user logs in
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      // Tell server this user is online
      newSocket.emit("user_online", user._id);
    });

    // Listen for online users list updates
    newSocket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    // Cleanup — disconnect when component unmounts or user changes
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};