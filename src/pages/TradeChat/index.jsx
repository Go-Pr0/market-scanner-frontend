import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import useTradeQuestions from '../../hooks/useTradeQuestions';
import useAIAssistant from '../../hooks/useAIAssistant';
import './TradeChat.css';

function TradeChatPage() {
  const navigate = useNavigate();
  const { questions } = useTradeQuestions();
  const {
    currentChatId,
    messages,
    loading,
    error,
    recentChats,
    loadingChats,
    sendMessage,
    startNewChat,
    switchToChat,
    removeChatFromList,
    getCurrentChat,
    clearError
  } = useAIAssistant();

  const [status, setStatus] = useState('pre-trade');
  const [input, setInput] = useState('Hi, help me prepare for the following action: \n\n');
  const [showChatList, setShowChatList] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Redirect to setup if no questions cached
  useEffect(() => {
    if (!questions) {
      navigate('/trade-setup', { replace: true });
    }
  }, [questions, navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set initial textarea height on load
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const messageToSend = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (!currentChatId) {
        // Starting a new chat
        await sendMessage({
          message: messageToSend,
          status,
          contextData: {
            questions: questions.map((q) => q.question),
            answers: questions.map((q) => q.answer)
          }
        });
      } else {
        // Continuing existing chat
        await sendMessage({ message: messageToSend });
      }
    } catch (err) {
      // Error is handled in the hook
      console.error('Failed to send message:', err);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Auto-resize the textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    // Send message on Cmd+Enter or Ctrl+Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setShowChatList(false);
    setInput('Hi, help me prepare for the following action: \n\n');
  };

  const handleChatSelect = async (chatId) => {
    await switchToChat(chatId);
    setShowChatList(false);
    setInput('');
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await removeChatFromList(chatId);
    }
  };

  const formatChatTitle = (chat) => {
    return chat.title || `${chat.status === 'pre-trade' ? 'Pre-trade' : 'Management'} Chat`;
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentChat = getCurrentChat();

  return (
    <Layout className="dashboard">
      <div className="trade-chat-container">
        <div className="chat-header">
          <div className="chat-title-section">
            <h1 className="page-title">
              <span className="text-gradient">AI Trade Advisor</span>
            </h1>
            <div className="current-chat-info">
              {currentChat && (
                <>
                  <span className="chat-title">{formatChatTitle(currentChat)}</span>
                  <span className="chat-status">{currentChat.status}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="chat-controls">
            <button 
              className="btn btn-outline"
              onClick={() => setShowChatList(!showChatList)}
            >
              {showChatList ? 'Hide Chats' : 'Recent Chats'}
              {recentChats.length > 0 && (
                <span className="chat-count">({recentChats.length})</span>
              )}
            </button>
            
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              disabled={currentChatId !== null}
              className="btn btn-outline"
            >
              <option value="pre-trade">Pre-trade</option>
              <option value="management">Management</option>
            </select>
            
            <button className="btn btn-outline" onClick={handleNewChat}>
              New Chat
            </button>
            
            <Link to="/trade-setup" className="btn btn-outline">
              Questions
            </Link>
          </div>
        </div>

        {/* Chat List Sidebar */}
        {showChatList && (
          <div className="chat-list-sidebar">
            <div className="chat-list-header">
              <h3>Recent Chats</h3>
              <button 
                className="close-btn"
                onClick={() => setShowChatList(false)}
              >
                ×
              </button>
            </div>
            
            <div className="chat-list">
              {loadingChats ? (
                <div className="loading-chats">Loading chats...</div>
              ) : recentChats.length === 0 ? (
                <div className="no-chats">No recent chats</div>
              ) : (
                recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-list-item ${chat.id === currentChatId ? 'active' : ''}`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="chat-item-content">
                      <div className="chat-item-title">{formatChatTitle(chat)}</div>
                      <div className="chat-item-meta">
                        <span className="chat-item-status">{chat.status}</span>
                        <span className="chat-item-time">
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-chat-btn"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      title="Delete chat"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-window">
          {messages.length === 0 && !loading && (
            <div className="chat-welcome">
              <p>Start a conversation with the AI Trade Advisor</p>
              <p>Choose your status and ask about your trading plan or position management.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <div className="message-content">{msg.content}</div>
              {msg.timestamp && (
                <div className="message-time">{formatMessageTime(msg.timestamp)}</div>
              )}
            </div>
          ))}
          
          {loading && <div className="chat-bubble assistant loading">...</div>}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError} className="error-close">×</button>
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-form">
          <div className="input-field-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              disabled={loading}
            />
            {input.trim() && (
              <button 
                className="send-button" 
                onClick={handleSend} 
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2L22 12 12 22 10.59 20.59 18.17 13H2V11H18.17L10.59 3.41L12 2Z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default TradeChatPage; 