import { useAuth } from "../context/AuthContext";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();

  // Check if this message was sent by the logged in user
  const isOwn = message.sender._id === user._id;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {message.sender.username[0].toUpperCase()}
      </div>

      {/* Bubble */}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Username — only show for others */}
        {!isOwn && (
          <span className="text-xs text-gray-500 ml-1">
            {message.sender.username}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-sm ${
            isOwn
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-gray-800 text-gray-100 rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-600 mx-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;