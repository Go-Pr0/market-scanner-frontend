import { useState, useCallback, useEffect } from 'react';
import { sendChatMessage, getRecentChats, getChatHistory, deleteChat } from '../api';
import { useAuth } from '../contexts/AuthContextNew';

/**
 * Hook to manage AI assistant chat with persistent storage.
 */
export default function useAIAssistant() {
  const { isAuthenticated } = useAuth();
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content: '', timestamp: '' }
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);

  // Load recent chats on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadRecentChats();
    }
  }, [isAuthenticated]);

  const loadRecentChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const response = await getRecentChats();
      setRecentChats(response.data?.chats || []);
    } catch (err) {
      console.error('Failed to load recent chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadChatHistory = useCallback(async (chatId) => {
    if (!chatId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getChatHistory(chatId);
      const { chat, messages: chatMessages } = response.data;
      
      setCurrentChatId(chat.id);
      setMessages(chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        id: msg.id
      })));
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err.message || 'Failed to load chat history';
      setError(errorMsg);
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async ({ message, status = null, contextData = null }) => {
    if (!message.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const payload = {
        message,
        chat_id: currentChatId,
        status,
        context_data: contextData
      };

      const response = await sendChatMessage(payload);
      const { chat_id, message: aiMessage, is_new_chat } = response.data;

      const aiMessageFormatted = {
        role: 'assistant',
        content: aiMessage.content,
        timestamp: aiMessage.timestamp,
        id: aiMessage.id
      };

      setMessages(prev => [...prev, aiMessageFormatted]);

      if (is_new_chat || !currentChatId) {
        setCurrentChatId(chat_id);
        // Refresh recent chats to include the new chat
        loadRecentChats();
      }

      return response.data;
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err.message || 'Failed to send message';
      setError(errorMsg);
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, an error occurred: ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChatId, loading, loadRecentChats]);

  const startNewChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setError(null);
  }, []);

  const switchToChat = useCallback(async (chatId) => {
    if (chatId === currentChatId) return;
    await loadChatHistory(chatId);
  }, [currentChatId, loadChatHistory]);

  const removeChatFromList = useCallback(async (chatId) => {
    try {
      await deleteChat(chatId);
      
      // Remove from recent chats list
      setRecentChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If this was the current chat, start a new one
      if (chatId === currentChatId) {
        startNewChat();
      }
      
      return true;
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err.message || 'Failed to delete chat';
      setError(errorMsg);
      console.error('Failed to delete chat:', err);
      return false;
    }
  }, [currentChatId, startNewChat]);

  const getCurrentChat = useCallback(() => {
    if (!currentChatId) return null;
    return recentChats.find(chat => chat.id === currentChatId) || null;
  }, [currentChatId, recentChats]);

  return {
    // Current chat state
    currentChatId,
    messages,
    loading,
    error,
    
    // Chat list state
    recentChats,
    loadingChats,
    
    // Actions
    sendMessage,
    startNewChat,
    switchToChat,
    loadChatHistory,
    loadRecentChats,
    removeChatFromList,
    getCurrentChat,
    
    // Utilities
    clearError: () => setError(null)
  };
}