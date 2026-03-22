import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

// These are our hardcoded chat rooms
// In a real app these would come from the database
const ROOMS = [
  { id: "general", name: "general", description: "General chat" },
  { id: "tech", name: "tech", description: "Tech talk" },
  { id: "random", name: "random", description: "Random stuff" },
];

const Sidebar = ({ activeRoom, onRoomChange }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0">

      {/* App header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg">ChatApp</h1>
        <p className="text-gray-500 text-xs mt-0.5">Real-time messaging</p>
      </div>

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-2 px-2">
          Rooms
        </p>
        <div className="space-y-0.5">
          {ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomChange(room)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                activeRoom?.id === room.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-sm font-medium"># {room.name}</span>
              <p className={`text-xs mt-0.5 ${activeRoom?.id === room.id ? "text-indigo-200" : "text-gray-600"}`}>
                {room.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Current user footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-gray-500 text-xs">online</span>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;