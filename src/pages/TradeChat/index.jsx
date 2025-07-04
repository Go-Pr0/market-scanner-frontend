import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import useTradeQuestions from '../../hooks/useTradeQuestions';
import useTradeChat from '../../hooks/useTradeChat';
import './TradeChat.css';

function TradeChatPage() {
  const navigate = useNavigate();
  const { questions } = useTradeQuestions();
  const { messages, loading, error, ended, sendMessage, resetChat } = useTradeChat();
  const [status, setStatus] = useState('pre-trade');
  const [input, setInput] = useState('Hi, help me prepare for the following action: \n\n');
  const textareaRef = useRef(null);

  // Redirect to setup if no questions cached
  useEffect(() => {
    if (!questions) {
      navigate('/trade-setup');
    }
  }, [questions, navigate]);

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
      if (messages.length === 0) {
        // first message -> start chat
        await sendMessage({
          status,
          message: messageToSend,
          data: {
            questions: questions.map((q) => q.question),
            answers: questions.map((q) => q.answer)
          }
        });
      } else {
        await sendMessage({ status, message: messageToSend, end: false });
      }
    } catch {
      // error handled in hook
    }
  };

  const handleEnd = async () => {
    try {
      await sendMessage({ status, message: 'Thanks, we\'re done.', end: true });
    } catch {
      // error handled
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

  return (
    <Layout className="dashboard">
      <div className="trade-chat-container">
        <div className="chat-header">
          <h1 className="page-title"><span className="text-gradient">AI Trade Advisor Chat</span></h1>
          <div className="chat-controls">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              disabled={messages.length > 0}
              className="btn btn-outline"
            >
              <option value="pre-trade">Pre-trade</option>
              <option value="management">Management</option>
            </select>
            <button className="btn btn-outline" onClick={resetChat}>Reset</button>
            <button className="btn btn-outline" onClick={handleEnd} disabled={loading || messages.length === 0 || ended}>End Chat</button>
            <Link to="/trade-setup" className="btn btn-outline">Questions</Link>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-window">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble ${m.role}`}>{m.text}</div>
          ))}
          {loading && <div className="chat-bubble ai">...</div>}
        </div>

        {error && <div className="error-text">{error}</div>}

        {/* Input area */}
        {!ended ? (
          <div className="chat-input-form">
            <div className="input-field-wrapper">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
              />
              {input.trim() && (
                <button className="send-button" onClick={handleSend} disabled={loading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 2L22 12 12 22 10.59 20.59 18.17 13H2V11H18.17L10.59 3.41L12 2Z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="chat-ended">Chat has ended.</div>
        )}
      </div>
    </Layout>
  );
}

export default TradeChatPage; 