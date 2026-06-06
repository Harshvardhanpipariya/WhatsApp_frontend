import { format } from 'date-fns';

const MessageBubble = ({ message, currentUserId }) => {
  const isMe = message.sender === currentUserId;

  // Determine the status icon based on message status
  const getStatusIcon = () => {
    if (!isMe) return null;

    switch (message.status) {
      case 'sent':
        return (
          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.5 6.5L9 16L4.5 11.5L5.5 10.5L9 14L17.5 5.5L18.5 6.5Z"/>
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex items-center">
            <svg className="w-[12px] h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 6.5L9 16L4.5 11.5L5.5 10.5L9 14L17.5 5.5L18.5 6.5Z"/>
            </svg>
            <svg className="w-[12px] h-3.5 text-gray-400 -ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 6.5L9 16L4.5 11.5L5.5 10.5L9 14L17.5 5.5L18.5 6.5Z"/>
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex items-center h-4">
            <svg className="w-[12px] h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 6.5L9 16L4.5 11.5L5.5 10.5L9 14L17.5 5.5L18.5 6.5Z"/>
            </svg>
            <svg className="w-[12px] h-3.5 text-yellow-400 -ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 6.5L9 16L4.5 11.5L5.5 10.5L9 14L17.5 5.5L18.5 6.5Z"/>
            </svg>
          </div>
        );
      case 'sending':
        return (
          <svg className="w-3.5 h-3.5 text-gray-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.4 31.4"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.5 6.5L9 16L4.5 11.5L5.5 10.5L9 14L17.5 5.5L18.5 6.5Z"/>
          </svg>
        );
    }
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        {/* Sender name (only for received messages) */}
        {!isMe && message.senderName && (
          <p className="text-xs text-gray-400 mb-1 ml-1">
            {message.senderName}
          </p>
        )}
        
        <div
          className={`
            relative px-4 pt-3 pb-5 rounded-[24px] backdrop-blur-2xl border
            shadow-[0_8px_30px_rgba(0,0,0,0.25)]
            transition-all duration-300 hover:scale-[1.01]
            ${
              isMe
                ? 'bg-emerald-500/15 border-emerald-400/10 text-white rounded-br-md'
                : 'bg-white/[0.06] border-white/10 text-white rounded-bl-md'
            }
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[24px] pointer-events-none" />

          <p className="relative z-10 text-sm sm:text-[15px] leading-relaxed break-words pr-12">
            {message.text}
          </p>

          <div className="absolute bottom-2 right-3 flex items-center gap-1">
            <span className="text-[10px] text-gray-300 tracking-wide">
              {format(new Date(message.createdAt), 'hh:mm a')}
            </span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;