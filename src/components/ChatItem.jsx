// ChatItem.js - Column layout (time above, badge below)
const ChatItem = ({ chat, isSelected }) => {
  return (
    <div
      className={`
        flex items-center gap-3 p-3 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-blue-500/20 border-l-4 border-blue-500' 
          : 'hover:bg-white/5'
        }
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={chat.image}
          alt={chat.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <h3 className={`text-sm font-medium truncate ${chat.unseenCount > 0 ? 'text-white font-semibold' : 'text-gray-300'}`}>
          {chat.name}
        </h3>
        
        {/* Last Message */}
        <p className={`text-xs truncate mt-1 ${chat.unseenCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
          {chat.lastMessage}
        </p>
      </div>

      {/* Right Column - Time and Unseen Badge */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {/* Time */}
        <span className={`text-xs ${chat.unseenCount > 0 ? 'text-green-400 font-medium' : 'text-gray-500'}`}>
          {chat.time}
        </span>
        
        {/* Unseen Message Count Badge */}
        {chat.unseenCount > 0 && (
          <div className="bg-green-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            <span className="text-white text-[10px] font-bold">
              {chat.unseenCount > 99 ? '99+' : chat.unseenCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatItem;