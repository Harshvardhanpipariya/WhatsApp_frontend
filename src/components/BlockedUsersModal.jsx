import { useState, useEffect } from 'react';
import { socket } from '../service/socket';
import { useAuth } from '../context/AuthContext';

const BlockedUsersModal = ({ open, onClose, onUnblock }) => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use your backend route - CHANGE THIS TO MATCH YOUR BACKEND
  const API_BASE_URL = 'https://whatsapp-backend-xz82.onrender.com/api/chatDashboard';

  const fetchBlockedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('🔍 Fetching blocked users from:', `${API_BASE_URL}/blocked-users`);
      
      const response = await fetch(`${API_BASE_URL}/blocked-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Blocked users response:', data);
      
      if (data.success) {
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const handleUnblock = async (userId, userName) => {
    if (!window.confirm(`Unblock ${userName}? They will be able to message you again.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      console.log('🔓 Unblocking user:', userId);
      console.log('API URL:', `${API_BASE_URL}/unblock/${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/unblock/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Unblock response:', data);
      
      if (data.success) {
        // Emit unblock event
        socket.emit('userUnblocked', {
          unblockedUserId: userId,
          unblockerId: user._id
        });
        
        // Refresh the list
        await fetchBlockedUsers();
        
        // Callback to parent
        if (onUnblock) {
          onUnblock(userId);
        }
        
        alert(`${userName} has been unblocked`);
      } else {
        alert(data.message || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert(`Error unblocking user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBlockedUsers();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Blocked Users
          </h1>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* BLOCKED USERS LIST */}
        {blockedUsers.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">🔒</div>
            <p className="text-gray-300">
              No blocked users found.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Users you block will not be able to message you.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {blockedUsers.map((blockedUser) => (
              <div
                key={blockedUser._id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={blockedUser.photo || 'https://i.pravatar.cc/150'}
                    alt={blockedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{blockedUser.name}</p>
                    <p className="text-xs text-gray-400">
                      Blocked on {new Date(blockedUser.blockedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(blockedUser._id, blockedUser.name)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            Blocked users cannot message you or see your online status
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockedUsersModal;