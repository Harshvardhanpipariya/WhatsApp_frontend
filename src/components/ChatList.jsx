import ChatItem from './ChatItem';
import { useEffect, useState, useCallback } from 'react';
import { socket } from '../service/socket';
import { useAuth } from '../context/AuthContext';

const ChatList = ({ users, selectedUser, setSelectedUser, onBlockedUserClick }) => {
  const { user } = useAuth();
  const [messagesData, setMessagesData] = useState({});
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use your backend route
  const API_BASE_URL = 'http://localhost:5000/api/chatDashboard';

  // Fetch blocked users (users that current user has blocked)
  const fetchBlockedUsers = useCallback(async () => {
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
  }, [API_BASE_URL]);

  // Fetch users who have blocked the current user
  const fetchBlockedByUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/users-blocked-me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBlockedByUsers(data.users || []);
        }
      }
    } catch (error) {
      console.error('Error fetching users who blocked me:', error);
    }
  }, [API_BASE_URL]);

  // Refresh all data
  const refreshData = useCallback(() => {
    if (user) {
      Promise.all([fetchBlockedUsers(), fetchBlockedByUsers()]).then(() => {
        setRefreshTrigger(prev => prev + 1);
      });
    }
  }, [user, fetchBlockedUsers, fetchBlockedByUsers]);

  useEffect(() => {
    if (user) {
      fetchBlockedUsers();
      fetchBlockedByUsers();
    }
  }, [user, fetchBlockedUsers, fetchBlockedByUsers]);

  // Listen for socket events and refresh data
  useEffect(() => {
    if (!user) return;

    const handleUserBlocked = ({ blockedUserId, blockerId }) => {
      console.log('🚫 User blocked event received:', { blockedUserId, blockerId });
      if (blockerId === user._id) {
        refreshData();
        setMessagesData(prev => {
          const newData = { ...prev };
          delete newData[blockedUserId];
          return newData;
        });
      } else if (blockedUserId === user._id) {
        refreshData();
      }
    };

    const handleUserUnblocked = ({ unblockedUserId, unblockerId }) => {
      console.log('✅ User unblocked event received:', { unblockedUserId, unblockerId });
      if (unblockerId === user._id || unblockedUserId === user._id) {
        refreshData();
      }
    };

    socket.on('userBlocked', handleUserBlocked);
    socket.on('userUnblocked', handleUserUnblocked);

    return () => {
      socket.off('userBlocked', handleUserBlocked);
      socket.off('userUnblocked', handleUserUnblocked);
    };
  }, [user, refreshData]);

  // Listen for new messages and update last message & unseen count
  useEffect(() => {
    if (!user) return;

    const handleReceiveMessage = (message) => {
      const isSenderBlocked = blockedUsers.some(blocked => blocked._id === message.sender);
      if (isSenderBlocked) return;

      const isSenderBlockedMe = blockedByUsers.some(blocked => blocked._id === message.sender);
      if (isSenderBlockedMe) return;

      setMessagesData(prev => {
        const chatId = message.sender === user._id ? message.receiver : message.sender;
        const currentData = prev[chatId] || { lastMessage: '', lastMessageTime: null, unseenCount: 0 };
        
        let newUnseenCount = currentData.unseenCount;
        if (message.receiver === user._id && selectedUser?._id !== message.sender) {
          newUnseenCount = (currentData.unseenCount || 0) + 1;
        }
        
        return {
          ...prev,
          [chatId]: {
            lastMessage: message.text,
            lastMessageTime: new Date(),
            unseenCount: newUnseenCount,
            messageType: 'text'
          }
        };
      });
    };

    const handleMessageRead = ({ chatId, readBy }) => {
      setMessagesData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          unseenCount: 0
        }
      }));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageRead', handleMessageRead);
    };
  }, [user, selectedUser, blockedUsers, blockedByUsers]);

  // Reset unseen count when selecting a chat
  useEffect(() => {
    if (selectedUser && user) {
      setMessagesData(prev => ({
        ...prev,
        [selectedUser._id]: {
          ...prev[selectedUser._id],
          unseenCount: 0
        }
      }));
      socket.emit('markMessagesAsRead', { otherUserId: selectedUser._id });
    }
  }, [selectedUser, user]);

  // Format last message time
  const formatMessageTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    }
  };

  // Filter users - EXCLUDE blocked ones
  const filteredUsers = users.filter(userItem => {
    const isBlockedByMe = blockedUsers.some(blocked => blocked._id === userItem._id);
    const isBlockedByThem = blockedByUsers.some(blocked => blocked._id === userItem._id);
    return !isBlockedByMe && !isBlockedByThem;
  });

  // Map users to chat items
  const userChatItems = filteredUsers.map(userItem => {
    const chatData = messagesData[userItem._id] || {};
    
    return {
      id: userItem._id,
      name: userItem.name,
      image: userItem.photo || 'https://i.pravatar.cc/150',
      lastMessage: chatData.lastMessage || 'Click to start chatting',
      lastMessageTime: chatData.lastMessageTime || null,
      time: chatData.lastMessageTime ? formatMessageTime(chatData.lastMessageTime) : '',
      unseenCount: chatData.unseenCount || 0,
      originalUser: userItem,
      type: 'user',
      isSelected: selectedUser?._id === userItem._id
    };
  });

  // SORT CHATS BY LATEST MESSAGE FIRST (most recent at the top)
  const sortedChatItems = [...userChatItems].sort((a, b) => {
    // If both have no messages, sort by name
    if (!a.lastMessageTime && !b.lastMessageTime) {
      return a.name.localeCompare(b.name);
    }
    // If a has no messages, put it at the bottom
    if (!a.lastMessageTime) return 1;
    // If b has no messages, put it at the bottom
    if (!b.lastMessageTime) return -1;
    // Sort by most recent message time (descending)
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });

  const handleChatClick = (chat) => {
    setSelectedUser(chat.originalUser);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* User Chats - Sorted by Latest Message */}
      {sortedChatItems.length > 0 && (
        <>
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Chats ({sortedChatItems.length})
            </h3>
          </div>
          {sortedChatItems.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="cursor-pointer"
            >
              <ChatItem
                chat={chat}
                isSelected={chat.isSelected}
              />
            </div>
          ))}
        </>
      )}

      {/* Empty State */}
      {sortedChatItems.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">No chats available</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;