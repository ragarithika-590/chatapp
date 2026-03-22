import Message from "../models/Message.js";
import User from "../models/User.js";

// Track online users — maps userId to socketId
// This lives in memory, which is fine for a single server
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ── USER COMES ONLINE ──────────────────────────────────────────
    // Frontend emits this right after connecting, passing their userId
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);

      // Broadcast to everyone that this user is now online
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`User online: ${userId}`);
    });

    // ── JOIN A ROOM ────────────────────────────────────────────────
    socket.on("join_room", async ({ roomId, userId }) => {
      socket.join(roomId); // Socket.io built-in — adds socket to the room
      console.log(`User ${userId} joined room ${roomId}`);

      try {
        // Fetch last 50 messages for this room, oldest first
        const messages = await Message.find({ roomId })
          .sort({ createdAt: 1 })
          .limit(50)
          .populate("sender", "username profilePic");
          // populate replaces sender ObjectId with actual user data

        // Send message history only to the user who just joined
        socket.emit("message_history", messages);
      } catch (error) {
        console.error("Error fetching message history:", error.message);
      }
    });

    // ── SEND A MESSAGE ─────────────────────────────────────────────
    socket.on("send_message", async ({ roomId, senderId, content }) => {
      try {
        // Save message to MongoDB first
        const message = await Message.create({
          roomId,
          sender: senderId,
          content,
        });

        // Then populate sender info so frontend gets full user object
        const populatedMessage = await message.populate(
          "sender",
          "username profilePic"
        );

        // Broadcast to everyone in the room including sender
        io.to(roomId).emit("receive_message", populatedMessage);
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── LEAVE A ROOM ───────────────────────────────────────────────
    socket.on("leave_room", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`User ${userId} left room ${roomId}`);
    });

    // ── USER GOES OFFLINE ──────────────────────────────────────────
    socket.on("disconnect", () => {
      // Find which userId this socket belonged to and remove them
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("online_users", Array.from(onlineUsers.keys()));
          console.log(`User offline: ${userId}`);
          break;
        }
      }
    });
  });
};

export default socketHandler;