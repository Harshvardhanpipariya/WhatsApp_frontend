// MessageContainer.js - Private chat only
import MessageBubble from './MessageBubble';
import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '../service/socket';
import { useAuth } from '../context/AuthContext';

const MessageContainer = ({ selectedUser, selectedGroup, clearChatTrigger, onChatCleared }) => {
  const [messages, setMessages] = useState([]);
  const [conversationKey, setConversationKey] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();

  // Determine if we're in a group chat or private chat - REMOVED group logic, now only private
  const isGroupChat = false; // Always false now
  const chatId = selectedUser?._id;
  const chatName = selectedUser?.name;

  // Helper function to format date based on current date
  const formatDateLabel = (messageDate) => {
    const msgDate = new Date(messageDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const msgDateStart = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
    
    if (msgDateStart.getTime() === todayStart.getTime()) {
      return 'Today';
    } else if (msgDateStart.getTime() === yesterdayStart.getTime()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  const getMessagesWithDateSeparators = useCallback(() => {
    if (!messages.length) return [];
    
    const result = [];
    let lastDateKey = null;
    
    messages.forEach((message) => {
      const messageDate = message.createdAt || message.timestamp || message.sentAt;
      if (!messageDate) {
        result.push({ type: 'message', data: message });
        return;
      }
      
      const currentDateKey = getDateKey(messageDate);
      
      if (currentDateKey !== lastDateKey) {
        result.push({
          type: 'dateSeparator',
          data: {
            date: messageDate,
            formattedDate: formatDateLabel(messageDate)
          }
        });
        lastDateKey = currentDateKey;
      }
      
      result.push({ type: 'message', data: message });
    });
    
    return result;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser, scrollToBottom]);

  // Update message status for private chats
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => prev.map(msg => {
      const msgId = msg.id || msg._id;
      if (msgId === messageId && msg.sender === user?._id) {
        console.log(`🔄 Updating message ${messageId} status to: ${status}`);
        return { ...msg, status };
      }
      return msg;
    }));
  }, [user?._id]);

  // Handle multiple messages read at once
  const handleMessagesRead = useCallback(({ byUserId }) => {
    if (byUserId === selectedUser?._id) {
      console.log('📚 Multiple messages marked as read by', byUserId);
      setMessages(prev => prev.map(msg => {
        if (msg.sender === user?._id && msg.status !== 'read') {
          return { ...msg, status: 'read' };
        }
        return msg;
      }));
    }
  }, [selectedUser?._id, user?._id]);

  const handleClearChat = useCallback(() => {
    if (!selectedUser || !user) return;
    
    console.log('🗑️ Clearing messages for:', chatName);
    setMessages([]);
    setTypingUser(null);
    
    if (onChatCleared) {
      onChatCleared();
    }
  }, [selectedUser, user, onChatCleared, chatName]);

  useEffect(() => {
    if (clearChatTrigger > 0 && selectedUser) {
      console.log('🗑️ Clear chat triggered from parent, trigger count:', clearChatTrigger);
      handleClearChat();
    }
  }, [clearChatTrigger, selectedUser, handleClearChat]);

  // Load chat history when switching conversations
  useEffect(() => {
    if (!selectedUser || !user) {
      setMessages([]);
      setConversationKey('');
      setTypingUser(null);
      return;
    }

    const newConversationKey = [user._id, selectedUser._id].sort().join('_');
    
    if (newConversationKey !== conversationKey) {
      console.log('🔄 Switching conversation to:', chatName);
      setConversationKey(newConversationKey);
      setMessages([]);
      setTypingUser(null);
      
      if (socket && socket.connected) {
        socket.emit('getChatHistory', { otherUserId: selectedUser._id });
      }
    }
  }, [selectedUser?._id, user?._id, conversationKey, chatName]);

  // Listen for messages and typing indicators
  useEffect(() => {
    if (!user || !selectedUser) return;

    // Handle private chat history
    const handleChatHistory = (history) => {
      console.log('📜 Received private chat history:', history?.length || 0, 'messages');
      if (history && history.length > 0) {
        const firstMsg = history[0];
        const isRelevant = 
          (firstMsg.sender === user._id && firstMsg.receiver === selectedUser?._id) ||
          (firstMsg.sender === selectedUser?._id && firstMsg.receiver === user._id);
        
        if (isRelevant) {
          const messagesWithStatus = history.map(msg => ({
            ...msg,
            status: msg.status || (msg.sender === user._id ? 'sent' : 'delivered')
          }));
          setMessages(messagesWithStatus);
        }
      }
    };

    // Handle private message receive
    const handleReceiveMessage = (message) => {
      console.log('📥 New private message received:', message?.text);
      
      if (!message) return;
      
      const isRelevant = 
        (message.sender === selectedUser?._id && message.receiver === user._id) ||
        (message.sender === user._id && message.receiver === selectedUser?._id);

      if (isRelevant) {
        setMessages((prev) => {
          const exists = prev.some(msg => {
            const msgId = msg.id || msg._id;
            const newMsgId = message.id || message._id;
            return msgId === newMsgId;
          });
          
          if (exists) {
            return prev.map(msg => {
              const msgId = msg.id || msg._id;
              const newMsgId = message.id || message._id;
              if (msgId === newMsgId && msg.status !== message.status) {
                return { ...msg, status: message.status };
              }
              return msg;
            });
          }
          
          const newMessage = {
            ...message,
            status: message.status || (message.sender === user._id ? 'sent' : 'delivered')
          };
          
          return [...prev, newMessage];
        });
        
        setTypingUser(null);
        
        if (message.sender === selectedUser?._id && message.status !== 'read') {
          console.log('📤 Sending read receipt for message:', message.id || message._id);
          socket.emit('messageRead', { 
            messageId: message.id || message._id, 
            senderId: message.sender,
            receiverId: user._id 
          });
        }
      }
    };

    // Handle message delivered status
    const handleMessageDelivered = ({ messageId, userId }) => {
      if (userId === selectedUser?._id) {
        updateMessageStatus(messageId, 'delivered');
      }
    };

    // Handle message read status
    const handleMessageRead = ({ messageId, userId }) => {
      if (userId === selectedUser?._id) {
        updateMessageStatus(messageId, 'read');
      }
    };

    // Handle messages read (bulk)
    const handleMessagesRead = ({ byUserId }) => {
      if (byUserId === selectedUser?._id) {
        setMessages(prev => prev.map(msg => {
          if (msg.sender === user._id && msg.status !== 'read') {
            return { ...msg, status: 'read' };
          }
          return msg;
        }));
      }
    };

    // Handle private typing indicator
    const handleUserTyping = ({ userId, senderName, isTyping }) => {
      if (userId === selectedUser?._id) {
        if (isTyping) {
          setTypingUser(senderName);
          
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        } else {
          setTypingUser(null);
        }
      }
    };

    // Handle conversation cleared
    const handleConversationCleared = ({ conversationId }) => {
      const currentConversationId = [user._id, selectedUser?._id].sort().join('_');
      if (conversationId === currentConversationId) {
        console.log('📢 Conversation cleared by other user');
        setMessages([]);
        if (onChatCleared) {
          onChatCleared();
        }
      }
    };

    // Set up listeners
    socket.on('chatHistory', handleChatHistory);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('messageRead', handleMessageRead);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('userTyping', handleUserTyping);
    socket.on('conversationCleared', handleConversationCleared);

    console.log('👂 Socket listeners attached for user:', chatName);

    return () => {
      socket.off('chatHistory', handleChatHistory);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageDelivered', handleMessageDelivered);
      socket.off('messageRead', handleMessageRead);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('userTyping', handleUserTyping);
      socket.off('conversationCleared', handleConversationCleared);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user?._id, selectedUser?._id, onChatCleared, updateMessageStatus, chatName]);

  const messagesWithSeparators = getMessagesWithDateSeparators();
  const showTyping = typingUser;

  // Show appropriate empty state
  const getEmptyState = () => {
    if (!selectedUser) {
      return {
        icon: "💬",
        title: "Select a chat",
        message: "Choose a user to start chatting"
      };
    }
    return {
      icon: "👋",
      title: `Start a conversation with ${chatName}`,
      message: "Send a message to begin chatting"
    };
  };

  const emptyState = getEmptyState();

  return (
    <div className="relative flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://wallpaperaccess.com/full/1288076.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-[#020617]/55 backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0f172a]/20 to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
      </div>

      {/* Messages Container */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6">
        <div className="min-h-full flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">{emptyState.icon}</div>
                <p className="text-gray-400 text-lg">{emptyState.title}</p>
              </div>
            </div>
          ) : messages.length === 0 && !showTyping ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">{emptyState.icon}</div>
                <p className="text-gray-400 text-lg">
                  {emptyState.title}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {emptyState.message}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1" />
              <div className="space-y-4 pb-4">
                {messagesWithSeparators.map((item, index) => {
                  if (item.type === 'dateSeparator') {
                    return (
                      <div key={`date-${item.data.date}-${index}`} className="flex justify-center my-4">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                          <span className="text-xs text-gray-300 font-medium">
                            {item.data.formattedDate}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={item.data.id || item.data._id || index}
                      className="transition-opacity duration-200 ease-in-out"
                    >
                      <MessageBubble
                        message={item.data}
                        currentUserId={user?._id}
                        isGroupChat={false}
                      />
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {showTyping && (
                  <div className="flex justify-start pl-4">
                    <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">
                          {showTyping} is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#020617]/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default MessageContainer;