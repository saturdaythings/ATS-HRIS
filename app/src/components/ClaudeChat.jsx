import { useState, useEffect, useRef } from 'react';
import useClaudeChat from '../hooks/useClaudeChat';

/**
 * Claude Chat Component
 * Floating chat widget for feature requests and custom field generation
 * Positioned in bottom-right corner of the page
 */
export default function ClaudeChat() {
  const {
    featureRequestId,
    messages,
    loading,
    error,
    sendMessage,
    startNewConversation,
    createCustomField,
  } = useClaudeChat();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const content = inputValue;
    setInputValue('');
    setLocalError(null);

    const result = await sendMessage(content);

    if (!result) {
      setLocalError(error || 'Failed to send message');
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e) => {
    // Enter to send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    // Escape to close
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  /**
   * Handle creating a custom field from Claude's suggestion
   */
  const handleCreateField = async (fieldData) => {
    const result = await createCustomField(fieldData);
    if (result) {
      setLocalError(null);
      // Add a confirmation message to chat
      await sendMessage(`Great! I've created the "${result.label}" field. Would you like to create another field or request a different feature?`);
    } else {
      setLocalError(error || 'Failed to create field');
    }
  };

  /**
   * Handle new conversation
   */
  const handleNewConversation = () => {
    startNewConversation();
    setInputValue('');
    setLocalError(null);
  };

  // Display error (priority: local error, then hook error)
  const displayError = localError || error;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-40"
        title={isOpen ? 'Close chat' : 'Open chat'}
        aria-label="Claude Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Feature Assistant</h3>
              <p className="text-xs text-blue-100">Powered by Claude</p>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleNewConversation}
                  className="p-1.5 hover:bg-blue-700 rounded transition-colors"
                  title="Start new conversation"
                  aria-label="New conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-blue-700 rounded transition-colors"
                title="Close chat"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="mb-2">Welcome to the Feature Assistant!</p>
                <p className="text-sm">Tell me what feature or custom field you need, and I'll help you create it.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Show actions if available */}
                    {msg.role === 'assistant' && msg.actions?.shouldCreateField && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <button
                          onClick={() => handleCreateField(msg.actions.fieldSuggestion)}
                          disabled={loading}
                          className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Creating...' : 'Create This Field'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="bg-red-50 border-t border-red-200 px-4 py-2">
              <p className="text-xs text-red-700">{displayError}</p>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you need..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600 rounded-b-lg">
            <p>💡 Tip: Press Enter to send, Escape to close</p>
          </div>
        </div>
      )}
    </>
  );
}
