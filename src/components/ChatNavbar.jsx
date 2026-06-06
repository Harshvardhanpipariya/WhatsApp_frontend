import { MoreVertical, Ban, Trash2, X, AlertTriangle, UserCheck, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { socket } from '../service/socket';
import { useAuth } from '../context/AuthContext';

const ChatNavbar = ({ selectedUser, onClearChat, onUserBlocked, onUserUnblocked }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userLastSeen, setUserLastSeen] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByUser, setIsBlockedByUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const menuRef = useRef();
  const { user } = useAuth();

  // Use your actual backend routes
  const API_BASE_URL = 'http://localhost:5000/api/chatDashboard';

  // Check if user is blocked
  const checkBlockStatus = async () => {
    if (!selectedUser || !user) return;

    try {
      console.log('🔍 Checking block status for user:', selectedUser._id);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/${selectedUser._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Block status response:', data);
      
      if (data.success) {
        setIsBlocked(data.user.isBlocked || false);
        setIsBlockedByUser(data.user.isBlockedByUser || false);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
      setError('Failed to check block status');
    }
  };

  // Track online users
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      console.log('📊 Initial online users list:', users);
      setOnlineUsers(new Set(users));
    };

    const handleUserOnline = (userId) => {
      console.log('🟢 User came online:', userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    };

    const handleUserOffline = (userId) => {
      console.log('🔴 User went offline:', userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleUserStatus = ({ userId, isOnline, lastSeen }) => {
      console.log('📊 User status received:', { userId, isOnline, lastSeen });
      
      if (isOnline) {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(userId);
          return newSet;
        });
      }
      
      if (selectedUser && selectedUser._id === userId) {
        if (!isOnline) {
          setUserLastSeen(lastSeen);
        } else {
          setUserLastSeen(null);
        }
      }
    };

    const handleUserBlocked = ({ blockedUserId, blockerId }) => {
      console.log('🚫 User blocked event:', { blockedUserId, blockerId });
      if (selectedUser && selectedUser._id === blockedUserId) {
        setIsBlocked(true);
        if (onUserBlocked) {
          onUserBlocked(blockedUserId);
        }
      }
    };

    const handleUserUnblocked = ({ unblockedUserId, unblockerId }) => {
      console.log('✅ User unblocked event:', { unblockedUserId, unblockerId });
      if (selectedUser && selectedUser._id === unblockedUserId) {
        setIsBlocked(false);
        if (onUserUnblocked) {
          onUserUnblocked(unblockedUserId);
        }
      }
    };

    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('userStatus', handleUserStatus);
    socket.on('userBlocked', handleUserBlocked);
    socket.on('userUnblocked', handleUserUnblocked);

    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('userStatus', handleUserStatus);
      socket.off('userBlocked', handleUserBlocked);
      socket.off('userUnblocked', handleUserUnblocked);
    };
  }, [selectedUser?._id, onUserBlocked, onUserUnblocked]);

  // Check selected user status and block status
  useEffect(() => {
    if (!selectedUser) return;

    console.log('🔍 Checking status for:', selectedUser.name, selectedUser._id);
    
    const isOnline = onlineUsers.has(selectedUser._id);
    console.log('   Currently online:', isOnline);

    if (isOnline) {
      setUserLastSeen(null);
    } else {
      if (socket) {
        socket.emit('getUserStatus', selectedUser._id);
      }
      
      const timeoutId = setTimeout(() => {
        if (socket) {
          socket.emit('getUserStatus', selectedUser._id);
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedUser?._id, onlineUsers]);

  // Check block status when selected user changes
  useEffect(() => {
    if (selectedUser) {
      checkBlockStatus();
    }
  }, [selectedUser]);

  const isUserOnline = selectedUser ? onlineUsers.has(selectedUser._id) : false;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBlock = () => {
    setShowMenu(false);
    setShowBlockModal(true);
  };

  const handleUnblock = () => {
    setShowMenu(false);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔨 Blocking user:', selectedUser._id);
      console.log('API URL:', `${API_BASE_URL}/block/${selectedUser._id}`);
      
      const response = await fetch(`${API_BASE_URL}/block/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Block response:', data);
      
      if (data.success) {
        setIsBlocked(true);
        setIsBlockedByUser(false);
        
        if (socket) {
          socket.emit('userBlocked', {
            blockedUserId: selectedUser._id,
            blockerId: user._id
          });
        }
        
        setShowBlockModal(false);
        alert(`${selectedUser.name} has been blocked`);
        
        if (onUserBlocked) {
          onUserBlocked(selectedUser._id);
        }
      } else {
        throw new Error(data.message || 'Failed to block user');
      }
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      setError(error.message);
      alert(`Error blocking user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmUnblock = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔓 Unblocking user:', selectedUser._id);
      console.log('API URL:', `${API_BASE_URL}/unblock/${selectedUser._id}`);
      
      const response = await fetch(`${API_BASE_URL}/unblock/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Unblock response:', data);
      
      if (data.success) {
        setIsBlocked(false);
        
        if (socket) {
          socket.emit('userUnblocked', {
            unblockedUserId: selectedUser._id,
            unblockerId: user._id
          });
        }
        
        setShowBlockModal(false);
        alert(`${selectedUser.name} has been unblocked`);
        
        if (onUserUnblocked) {
          onUserUnblocked(selectedUser._id);
        }
      } else {
        throw new Error(data.message || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('❌ Error unblocking user:', error);
      setError(error.message);
      alert(`Error unblocking user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChatClick = () => {
    setShowMenu(false);
    setShowClearModal(true);
  };

  const handleClearChatConfirm = async () => {
    if (onClearChat && selectedUser) {
      await onClearChat(selectedUser._id);
    }
    setShowClearModal(false);
  };

  const formatLastSeen = (date) => {
    if (!date) return 'offline';
    
    const now = new Date();
    const last = new Date(date);
    const diffMs = now - last;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'last seen just now';
    if (diffMins === 1) return 'last seen 1 min ago';
    if (diffMins < 60) return `last seen ${diffMins} mins ago`;
    if (diffHours === 1) return 'last seen 1 hour ago';
    if (diffHours < 24) return `last seen ${diffHours} hours ago`;
    if (diffDays === 1) return 'last seen yesterday';
    if (diffDays < 7) return `last seen ${diffDays} days ago`;
    return `last seen ${last.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  // If user is blocked by other person, show blocked banner
  if (isBlockedByUser) {
    return (
      <>
        <div className="relative z-[100] h-16 overflow-visible bg-[#0f172a]/80 backdrop-blur-3xl border-l border-white/5 border-b border-white/5 flex items-center justify-between px-4 shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent pointer-events-none" />

          <div className="relative flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={selectedUser?.photo || "https://i.pravatar.cc/150?img=5"}
                className="w-11 h-11 rounded-full object-cover border border-white/10 shadow-lg opacity-50 grayscale"
                alt={selectedUser?.name}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-white font-medium truncate tracking-wide text-[15px]">
                {selectedUser?.name}
              </h2>
              <p className="text-xs text-red-400 flex items-center gap-1">
                <Ban size={12} />
                You have been blocked
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBlockModal(true)}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.05] transition-all duration-200"
          >
            <MoreVertical size={22} />
          </button>
        </div>

        {/* Block Info Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative max-w-md w-full bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-red-500">
                  <Ban size={20} />
                  <h3 className="text-lg font-semibold">User Blocked You</h3>
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Ban size={24} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-gray-200 mb-2">
                      <span className="font-semibold text-white">{selectedUser?.name}</span> has blocked you.
                    </p>
                    <p className="text-sm text-gray-400">
                      You cannot send messages or see their online status. 
                      This will remain until they unblock you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t border-white/10">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Render for Private Chat
  return (
    <>
      <div className="relative z-[100] h-16 overflow-visible bg-[#0f172a]/80 backdrop-blur-3xl border-l border-white/5 border-b border-white/5 flex items-center justify-between px-4 shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {selectedUser ? (
              <>
                <img
                  src={selectedUser.photo || "https://i.pravatar.cc/150?img=5"}
                  className={`w-11 h-11 rounded-full object-cover border border-white/10 shadow-lg ${isBlocked ? 'opacity-50 grayscale' : ''}`}
                  alt={selectedUser.name}
                />
                
                {!isBlocked && (
                  <div 
                    className={`
                      absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a]
                      transition-all duration-300
                      ${isUserOnline ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-500'}
                    `}
                  />
                )}
              </>
            ) : (
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/50 text-lg">?</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-white font-medium truncate tracking-wide text-[15px]">
              {selectedUser ? selectedUser.name : "Select a User"}
            </h2>
            
            {selectedUser && !isBlocked && (
              <p className={`
                text-xs truncate transition-colors duration-300
                ${isUserOnline ? 'text-green-400' : 'text-gray-400'}
              `}>
                {isUserOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    online
                  </span>
                ) : (
                  formatLastSeen(userLastSeen)
                )}
              </p>
            )}

            {selectedUser && isBlocked && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <Ban size={12} />
                Blocked
              </p>
            )}
          </div>
        </div>

        <div className="relative z-[9999] flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.05] transition-all duration-200"
          >
            <MoreVertical size={22} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 w-56 bg-[#111827]/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden border border-white/10 z-[9999]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
              
              {isBlocked ? (
                <button
                  onClick={handleUnblock}
                  className="relative w-full flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-500/10 transition-all duration-200"
                >
                  <UserCheck size={18} />
                  Unblock User
                </button>
              ) : (
                <button
                  onClick={handleBlock}
                  className="relative w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <Ban size={18} />
                  Block User
                </button>
              )}

              <button
                onClick={handleClearChatClick}
                className="relative w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                <Trash2 size={18} />
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clear Chat Modal */}
      {showClearModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-red-500">
                <Trash2 size={20} />
                <h3 className="text-lg font-semibold">Clear Chat</h3>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="text-gray-200 mb-2">
                    Are you sure you want to clear all messages with <span className="font-semibold text-white">{selectedUser.name}</span>?
                  </p>
                  <p className="text-sm text-gray-400">
                    This action will permanently delete all messages in this conversation. 
                    This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-white/10">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChatConfirm}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-medium flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block/Unblock Confirmation Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className={`flex items-center gap-2 ${isBlocked ? 'text-green-500' : 'text-red-500'}`}>
                {isBlocked ? <UserCheck size={20} /> : <Ban size={20} />}
                <h3 className="text-lg font-semibold">
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </h3>
              </div>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isBlocked ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {isBlocked ? <UserCheck size={24} className="text-green-500" /> : <Ban size={24} className="text-red-500" />}
                </div>
                <div>
                  {isBlocked ? (
                    <>
                      <p className="text-gray-200 mb-2">
                        Unblock <span className="font-semibold text-white">{selectedUser.name}</span>?
                      </p>
                      <p className="text-sm text-gray-400">
                        They will be able to see your online status and send you messages again.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-200 mb-2">
                        Block <span className="font-semibold text-white">{selectedUser.name}</span>?
                      </p>
                      <p className="text-sm text-gray-400">
                        They will not be able to message you or see your online status.
                        This can be reversed later.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-white/10">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={isBlocked ? confirmUnblock : confirmBlock}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 ${
                  isBlocked 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isBlocked ? 'Unblock' : 'Block'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatNavbar;