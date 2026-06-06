// services/chatService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://whatsapp-backend-xz82.onrender.com/api';

export const chatService = {
  // Clear entire conversation
  clearConversation: async (otherUserId, authToken) => {
    try {
      const response = await axios.delete(
        `${API_URL}/messages/conversation/clear`,
        {
          data: { otherUserId },
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error.response?.data || error;
    }
  },

  // Archive conversation (soft delete)
  archiveConversation: async (otherUserId, authToken) => {
    try {
      const response = await axios.put(
        `${API_URL}/messages/conversation/archive`,
        { otherUserId },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error.response?.data || error;
    }
  },

  // Get conversation messages with pagination
  getConversationMessages: async (otherUserId, authToken, limit = 50, before = null) => {
    try {
      let url = `${API_URL}/messages/conversation/${otherUserId}?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error.response?.data || error;
    }
  },

  // Mark messages as read
  markAsRead: async (otherUserId, authToken) => {
    try {
      const response = await axios.put(
        `${API_URL}/messages/read/${otherUserId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error.response?.data || error;
    }
  },

  // Delete single message
  deleteMessage: async (messageId, authToken) => {
    try {
      const response = await axios.delete(
        `${API_URL}/messages/${messageId}`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error.response?.data || error;
    }
  }
};