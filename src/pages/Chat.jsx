import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatNavbar from '../components/ChatNavbar';
import MessageContainer from '../components/MessageContainer';
import MessageInput from '../components/MessageInput';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket, socket } from '../service/socket';

const Chat = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clearChatTrigger, setClearChatTrigger] = useState(0);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const { user, token } = useAuth();

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user?._id) {
      console.log('🔌 Connecting socket for user:', user._id);
      connectSocket(user._id);
    }

    return () => {
      console.log('🔌 Cleaning up socket connection');
      disconnectSocket();
    };
  }, [user]);

  // Track connection status
  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Socket connected event received');
      setIsConnected(true);
    };
    
    const onDisconnect = () => {
      console.log('❌ Socket disconnected event received');
      setIsConnected(false);
    };

    const onReconnect = (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);

    // Check initial state
    setIsConnected(socket.connected);

    // Debug connection status
    const checkConnection = setInterval(() => {
      const connected = socket.connected;
      console.log('🔍 Socket status:', connected ? 'CONNECTED' : 'DISCONNECTED');
      setIsConnected(connected);
    }, 5000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      clearInterval(checkConnection);
    };
  }, []);

  // Handle clear chat from navbar
  const handleClearChat = useCallback(async (userId) => {
    if (!selectedUser || selectedUser._id !== userId || !token) {
      console.error('Cannot clear chat: Invalid state', { selectedUser, userId, hasToken: !!token });
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-20 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-[9999]';
      notification.textContent = 'Cannot clear chat: Invalid state';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }

    setIsClearingChat(true);
    
    try {
      console.log('🗑️ Attempting to clear chat with:', selectedUser.name);
      console.log('   Other User ID:', userId);
      console.log('   Current User ID:', user._id);
      
      const response = await fetch('http://localhost:5000/api/messages/conversation/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: userId })
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        console.log(`✅ Cleared ${result.deletedCount} messages with ${selectedUser.name}`);
        setClearChatTrigger(prev => prev + 1);
        
        if (socket && socket.connected) {
          const conversationId = [user._id, userId].sort().join('_');
          socket.emit('clearConversation', {
            otherUserId: userId,
            conversationId: conversationId
          });
          console.log('📡 Emitted clearConversation socket event');
        }
        
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-20 right-4 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-[9999] animate-in slide-in-from-bottom-2 fade-in duration-300';
        notification.textContent = `Chat cleared with ${selectedUser.name}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } else {
        throw new Error(result.message || 'Failed to clear chat');
      }
    } catch (error) {
      console.error('Failed to clear chat:', error);
      
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-20 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-[9999] animate-in slide-in-from-bottom-2 fade-in duration-300';
      notification.textContent = error.message || 'Failed to clear chat. Please try again.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setIsClearingChat(false);
    }
  }, [selectedUser, user, token]);

  // Listen for conversation cleared events from other user
  useEffect(() => {
    if (!socket) return;

    const handleConversationCleared = ({ conversationId, clearedBy, success, deletedCount }) => {
      console.log('📢 Conversation cleared event received:', { conversationId, clearedBy, success, deletedCount });
      
      const currentConversationId = selectedUser ? 
        [user?._id, selectedUser._id].sort().join('_') : null;
      
      if (conversationId === currentConversationId) {
        console.log('🎯 Current conversation cleared, triggering UI update');
        setClearChatTrigger(prev => prev + 1);
        
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-20 right-4 bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-[9999] animate-in slide-in-from-bottom-2 fade-in duration-300';
        notification.textContent = `${selectedUser?.name} cleared the chat`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    };

    socket.on('conversationCleared', handleConversationCleared);

    return () => {
      socket.off('conversationCleared', handleConversationCleared);
    };
  }, [selectedUser, user]);

  // Close sidebar on mobile when user or group is selected
  useEffect(() => {
    if ((selectedUser || selectedGroup) && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [selectedUser, selectedGroup]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showSidebar) {
        setShowSidebar(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showSidebar]);

  return (
    <div className="h-screen overflow-hidden relative flex bg-[#020617]">
      {/* WALLPAPER */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://wallpaperaccess.com/full/1288076.jpg')",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-[2px]" />

      {/* GRADIENT LIGHT EFFECTS */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -bottom-40 -right-40" />

      {/* CLEARING CHAT LOADER */}
      {isClearingChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center">
          <div className="bg-[#111827]/95 backdrop-blur-3xl rounded-2xl p-6 border border-white/10 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-red-500 rounded-full animate-spin" />
            <p className="text-white text-sm">Clearing chat...</p>
          </div>
        </div>
      )}

      {/* CONNECTION LOST BANNER */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/90 backdrop-blur-sm text-white text-center py-2 px-4 z-[9999] animate-pulse">
          <p className="text-sm flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-ping"></span>
            Connection lost. Trying to reconnect...
            <button 
              onClick={() => {
                if (user?._id) {
                  connectSocket(user._id);
                }
              }}
              className="ml-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs"
            >
              Retry Now
            </button>
          </p>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900] lg:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:static
          z-[1000]
          top-0 left-0
          h-full
          w-[85%]
          sm:w-[380px]
          transform
          transition-transform
          duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full overflow-hidden backdrop-blur-3xl bg-white/[0.06] border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.45)]">
          <Sidebar 
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
        </div>
      </div>

      {/* CHAT SECTION */}
      <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* MOBILE TOP BAR */}
        <div className="lg:hidden h-16 flex items-center px-4 backdrop-blur-2xl bg-white/[0.05] border-b border-white/10">
          <button
            onClick={() => setShowSidebar(true)}
            className="text-white hover:scale-110 transition-all duration-200"
          >
            <Menu size={28} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-white">ChatSphere</h1>
        </div>

        {/* CHAT CARD */}
        <div className="flex-1 flex flex-col relative overflow-hidden lg:m-4 backdrop-blur-3xl bg-white/[0.05] border border-white/10 lg:rounded-[32px] shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          {/* NAVBAR */}
          <div className="relative z-[200] border-b border-white/10 flex-shrink-0">
            <ChatNavbar 
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              onClearChat={handleClearChat}
            />
          </div>

          {/* MESSAGE CONTAINER */}
          <div className="flex-1 min-h-0 relative overflow-y-auto">
            <MessageContainer 
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
              clearChatTrigger={clearChatTrigger}
              onChatCleared={() => {
                console.log('✅ Chat cleared in MessageContainer');
              }}
            />
          </div>

          {/* MESSAGE INPUT */}
          <div className="relative z-50 border-t border-white/10 flex-shrink-0">
            <MessageInput 
              selectedUser={selectedUser}
              selectedGroup={selectedGroup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;