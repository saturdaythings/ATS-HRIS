import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing Claude chat interactions
 * Handles sending messages, retrieving history, and managing conversation state
 */
export function useClaudeChat() {
  const [featureRequestId, setFeatureRequestId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved conversation from localStorage
  useEffect(() => {
    const savedConversationId = localStorage.getItem('currentFeatureRequestId');
    const savedMessages = localStorage.getItem('chatMessages');

    if (savedConversationId) {
      setFeatureRequestId(savedConversationId);
      // Fetch fresh conversation history
      fetchConversationHistory(savedConversationId);
    } else if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
  }, []);

  /**
   * Send a message to Claude
   * @param {string} content - Message content
   * @returns {Promise<Object>} Response from Claude
   */
  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim()) {
        setError('Message cannot be empty');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/claude/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            featureRequestId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`);
        }

        const data = await response.json();

        // Update feature request ID if this was a new conversation
        if (!featureRequestId && data.featureRequest?.id) {
          setFeatureRequestId(data.featureRequest.id);
          localStorage.setItem('currentFeatureRequestId', data.featureRequest.id);
        }

        // Add both user and assistant messages to state
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            role: 'user',
            content,
            createdAt: data.message.createdAt,
          },
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.assistantResponse,
            createdAt: new Date().toISOString(),
            actions: data.actions,
          },
        ]);

        // Save to localStorage
        const updatedMessages = [
          ...messages,
          { role: 'user', content },
          { role: 'assistant', content: data.assistantResponse, actions: data.actions },
        ];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

        return data;
      } catch (err) {
        const errorMessage = err.message || 'Failed to send message';
        setError(errorMessage);
        console.error('Error sending message:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [featureRequestId]
  );

  /**
   * Fetch conversation history for a feature request
   * @param {string} id - Feature request ID
   */
  const fetchConversationHistory = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/claude/conversations/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch conversation: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data);

        // Save to localStorage
        localStorage.setItem('chatMessages', JSON.stringify(data));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching conversation:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(() => {
    setMessages([]);
    setFeatureRequestId(null);
    setError(null);
    localStorage.removeItem('currentFeatureRequestId');
    localStorage.removeItem('chatMessages');
  }, []);

  /**
   * Create a custom field from Claude's suggestion
   * @param {Object} fieldData - Field configuration
   * @returns {Promise<Object>} Created custom field
   */
  const createCustomField = useCallback(
    async (fieldData) => {
      if (!featureRequestId) {
        setError('No active feature request');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/claude/create-field', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            featureRequestId,
            fieldData,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create field: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        setError(err.message);
        console.error('Error creating custom field:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [featureRequestId]
  );

  /**
   * Get feature request details
   * @returns {Promise<Object>} Feature request with full details
   */
  const getFeatureRequest = useCallback(async () => {
    if (!featureRequestId) {
      setError('No active feature request');
      return null;
    }

    try {
      const response = await fetch(`/api/claude/feature-requests/${featureRequestId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch feature request: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching feature request:', err);
      return null;
    }
  }, [featureRequestId]);

  return {
    // State
    featureRequestId,
    messages,
    loading,
    error,

    // Actions
    sendMessage,
    fetchConversationHistory,
    startNewConversation,
    createCustomField,
    getFeatureRequest,
  };
}

export default useClaudeChat;
