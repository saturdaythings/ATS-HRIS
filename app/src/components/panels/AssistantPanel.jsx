import { useState, useEffect, useRef } from 'react';
import '../../styles/assistant.css';

/**
 * AI Operations Assistant Panel
 * Natural language interface for system operations
 * - Query mode: Ask questions about candidates, employees, devices
 * - Action mode: Create, update, assign with confirmation
 */
export default function AssistantPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        confirmation: data.confirmation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Assistant error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (confirmation) => {
    if (!confirmation) return;

    try {
      await fetch(`/api/${confirmation.action}`, {
        method: confirmation.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmation.payload),
      });

      const confirmMessage = {
        role: 'user',
        content: 'Confirm',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);

      const doneMessage = {
        role: 'assistant',
        content: confirmation.successMessage || 'Done!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, doneMessage]);
    } catch (err) {
      console.error('Confirmation error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Failed to execute action. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleCancel = (msgIdx) => {
    // Remove confirmation from the message
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === msgIdx ? { ...msg, confirmation: null } : msg
      )
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-panel" role="dialog" aria-labelledby="ai-panel-title">
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-panel-title" id="ai-panel-title">
          Ask Oliver
          <span className="ai-status">Ready</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close assistant panel">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.length === 0 && (
          <div className="assistant-empty">
            Ask me anything about your team, candidates, devices, or processes.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.role}`}>
            <div className="msg-bubble">
              {msg.content}

              {/* Confirmation card */}
              {msg.confirmation && (
                <div className="confirm-card">
                  <div className="confirm-title">Confirm {msg.confirmation.title || msg.confirmation.action}</div>
                  {msg.confirmation.fields &&
                    msg.confirmation.fields.map((field, i) => (
                      <div key={i} className="confirm-row">
                        <span className="confirm-key">{field.label}</span>
                        <span className="confirm-val">{field.value}</span>
                      </div>
                    ))}
                  <div className="confirm-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleConfirm(msg.confirmation)}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCancel(idx)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="msg-time">
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="msg assistant">
            <div className="msg-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          className="ai-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Oliver anything or give an instruction..."
          disabled={isLoading}
        />
        <button
          className="ai-send"
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
