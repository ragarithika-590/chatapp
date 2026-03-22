import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      // which room this message belongs to
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links to the User model
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // tracks who has read this message — great interview talking point
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast querying — fetching messages by room will be very common
// This tells MongoDB to optimise lookups on roomId + createdAt
messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;