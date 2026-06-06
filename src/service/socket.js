import { io } from 'socket.io-client';

const SOCKET_URL = 'https://whatsapp-backend-xz82.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: true,
});

export const connectSocket = (userId) => {
  if (!userId) return;
  
  socket.auth = { userId };
  
  socket.off(); // Clear all listeners
  
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });
  
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

// Helper function to emit clear conversation
export const emitClearConversation = (otherUserId, conversationId) => {
  if (socket && socket.connected) {
    socket.emit('clearConversation', { otherUserId, conversationId });
    console.log('📡 Emitted clearConversation:', { otherUserId, conversationId });
  }
};

// Helper function to emit typing
export const emitTyping = (receiver, senderName, isTyping) => {
  if (socket && socket.connected) {
    socket.emit('typing', { receiver, senderName, isTyping });
  }
};

// Helper function to get chat history
export const emitGetChatHistory = (otherUserId) => {
  if (socket && socket.connected) {
    socket.emit('getChatHistory', { otherUserId });
  }
};

// Helper function to get user status
export const emitGetUserStatus = (userId) => {
  if (socket && socket.connected) {
    socket.emit('getUserStatus', userId);
  }
};

// Utility function to get conversation ID
export const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};