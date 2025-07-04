import { useState, useCallback } from 'react';
import { advisorChatMessage } from '../api';

/**
 * Hook to manage AI advisor chat conversation.
 */
export default function useTradeChat() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]); // { role: 'user'|'ai', text: '' }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ended, setEnded] = useState(false);

  const sendMessage = useCallback(async ({ status, message, data = null, end = false }) => {
    if (ended || loading) return;

    const userMessage = { role: 'user', text: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const payload = conversationId ?
        { conversation_id: conversationId, status, message, end } :
        { status, data, message };

      const response = await advisorChatMessage(payload);
      const reply = response.data?.reply || '';
      const newConvId = response.data?.conversation_id;
      const isNew = response.data?.new_chat;
      const isEnded = response.data?.ended;

      const aiMessage = { role: 'ai', text: reply };
      setMessages((prev) => [...prev, aiMessage]);

      if (isNew && newConvId) setConversationId(newConvId);
      if (isEnded) setEnded(true);

      return response.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Failed to send message';
      const errorMessage = { role: 'ai', text: `Sorry, an error occurred: ${msg}` };
      setError(msg);
      setMessages(prev => [...prev, errorMessage]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, ended, loading]);

  const resetChat = () => {
    setConversationId(null);
    setMessages([]);
    setEnded(false);
    setError(null);
  };

  return { conversationId, messages, loading, error, ended, sendMessage, resetChat };
} 