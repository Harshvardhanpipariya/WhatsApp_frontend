import { SmilePlus, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';
import { socket } from '../service/socket';
import { useAuth } from '../context/AuthContext';

const MessageInput = ({ selectedUser, selectedGroup }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const { user } = useAuth();

  // Determine if we're in a group chat or private chat
  const isGroupChat = !!selectedGroup;
  const receiverId = isGroupChat ? selectedGroup?._id : selectedUser?._id;
  const receiverName = isGroupChat ? selectedGroup?.name : selectedUser?.name;

  // Handle typing indicator
  const handleTyping = (value) => {
    setMessage(value);
    
    if (!receiverId || !user) return;
    
    // Emit typing event (different for group vs private)
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      if (socket && socket.connected) {
        if (isGroupChat) {
          socket.emit('groupTyping', {
            groupId: receiverId,
            senderName: user.name,
            isTyping: true
          });
        } else {
          socket.emit('typing', {
            receiver: receiverId,
            senderName: user.name,
            isTyping: true
          });
        }
      }
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        if (socket && socket.connected) {
          if (isGroupChat) {
            socket.emit('groupTyping', {
              groupId: receiverId,
              senderName: user.name,
              isTyping: false
            });
          } else {
            socket.emit('typing', {
              receiver: receiverId,
              senderName: user.name,
              isTyping: false
            });
          }
        }
      }
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && receiverId && socket && socket.connected) {
        if (isGroupChat) {
          socket.emit('groupTyping', {
            groupId: receiverId,
            senderName: user?.name,
            isTyping: false
          });
        } else {
          socket.emit('typing', {
            receiver: receiverId,
            senderName: user?.name,
            isTyping: false
          });
        }
      }
    };
  }, [isTyping, receiverId, user, isGroupChat]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmoji = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const sendMessage = () => {
    if (!message.trim() || !receiverId || !user) {
      console.log('❌ Cannot send: Missing required data', { 
        hasMessage: !!message.trim(), 
        hasReceiverId: !!receiverId, 
        hasUser: !!user 
      });
      return;
    }

    if (!socket || !socket.connected) {
      console.error('❌ Socket not connected!');
      alert('Connection lost. Please refresh the page.');
      return;
    }

    if (isGroupChat) {
      // Send group message
      const newMessage = {
        id: `group_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: message.trim(),
        sender: user._id,
        senderName: user.name || 'Unknown',
        groupId: selectedGroup._id,
        createdAt: new Date().toISOString(),
        type: 'text',
        isGroupMessage: true
      };

      console.log('📤 Sending group message:', newMessage);
      socket.emit('sendGroupMessage', newMessage);
    } else {
      // Send private message
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: message.trim(),
        sender: user._id,
        senderName: user.name || 'Unknown',
        receiver: selectedUser._id,
        receiverName: selectedUser.name,
        createdAt: new Date().toISOString(),
        type: 'text',
      };

      console.log('📤 Sending private message:', newMessage);
      socket.emit('sendMessage', newMessage);
    }
    
    // Stop typing indicator
    setIsTyping(false);
    if (socket && socket.connected) {
      if (isGroupChat) {
        socket.emit('groupTyping', {
          groupId: receiverId,
          senderName: user.name,
          isTyping: false
        });
      } else {
        socket.emit('typing', {
          receiver: receiverId,
          senderName: user.name,
          isTyping: false
        });
      }
    }
    
    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPlaceholderText = () => {
    if (!selectedUser && !selectedGroup) return "Select a user or group";
    if (isGroupChat) return `Message ${receiverName}`;
    return `Message ${receiverName}`;
  };

  const isDisabled = !selectedUser && !selectedGroup;

  return (
    <div className="relative z-300 px-4 py-3 bg-[#0f172a]/70 backdrop-blur-3xl border-t border-white/5">
      <div className="flex items-center gap-3 relative z-10">
        {/* EMOJI BUTTON */}
        <div className="relative" ref={emojiButtonRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
            disabled={isDisabled}
          >
            <SmilePlus size={26} />
          </button>

          {/* Emoji Picker - Now positioned correctly with lower z-index */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-[99999] shadow-2xl">
              <EmojiPicker
                theme="dark"
                onEmojiClick={handleEmoji}
                lazyLoadEmojis={true}
                width={350}
                height={400}
                searchPlaceholder="Search emojis..."
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* TEXT INPUT */}
        <div className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-emerald-500/50 transition-all">
          <input
            type="text"
            placeholder={getPlaceholderText()}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isDisabled}
            className="bg-transparent outline-none text-white placeholder-gray-400 w-full text-sm"
          />
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={sendMessage}
          disabled={isDisabled || !message.trim()}
          className="bg-emerald-500/80 hover:bg-emerald-400 p-3 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;