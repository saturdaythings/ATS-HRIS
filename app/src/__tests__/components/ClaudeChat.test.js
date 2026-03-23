import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClaudeChat from '../../components/ClaudeChat';

/**
 * Tests for ClaudeChat component
 * Covers rendering, user interactions, and message handling
 */

// Mock the useClaudeChat hook
jest.mock('../../hooks/useClaudeChat', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Import the mocked hook
import useClaudeChat from '../../hooks/useClaudeChat';

describe('ClaudeChat component', () => {
  const mockUseClaudeChat = {
    featureRequestId: null,
    messages: [],
    loading: false,
    error: null,
    sendMessage: jest.fn(),
    startNewConversation: jest.fn(),
    createCustomField: jest.fn(),
    fetchConversationHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useClaudeChat.mockReturnValue(mockUseClaudeChat);
  });

  it('should render floating button', () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
  });

  it('should toggle chat widget on button click', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');

    // Initially closed
    expect(screen.queryByText('Feature Assistant')).not.toBeInTheDocument();

    // Open chat
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Feature Assistant')).toBeInTheDocument();
    });

    // Close chat
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('Feature Assistant')).not.toBeInTheDocument();
    });
  });

  it('should display welcome message when no messages', () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    expect(screen.getByText('Welcome to the Feature Assistant!')).toBeInTheDocument();
    expect(screen.getByText(/Tell me what feature or custom field you need/)).toBeInTheDocument();
  });

  it('should display messages', async () => {
    const messagesWithContent = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'I need a custom field',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'I can help you create that',
        createdAt: new Date().toISOString(),
        actions: { shouldCreateField: false },
      },
    ];

    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      messages: messagesWithContent,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('I need a custom field')).toBeInTheDocument();
      expect(screen.getByText('I can help you create that')).toBeInTheDocument();
    });
  });

  it('should send a message', async () => {
    const user = userEvent.setup();
    const sendMessageMock = jest.fn().mockResolvedValue({});

    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      sendMessage: sendMessageMock,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Describe what you need...');
    await user.type(input, 'I need a status field');

    const sendButton = screen.getByText('Send');
    await user.click(sendButton);

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith('I need a status field');
      expect(input.value).toBe('');
    });
  });

  it('should send message on Enter key', async () => {
    const user = userEvent.setup();
    const sendMessageMock = jest.fn().mockResolvedValue({});

    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      sendMessage: sendMessageMock,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Describe what you need...');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith('Test message');
    });
  });

  it('should not send on Shift+Enter', async () => {
    const user = userEvent.setup();
    const sendMessageMock = jest.fn();

    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      sendMessage: sendMessageMock,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Describe what you need...');
    await user.type(input, 'Test');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    // Should not have called sendMessage (Shift+Enter allows multiline)
    // Input should still have text
    expect(input.value).toBe('Test\n');
  });

  it('should close on Escape key', async () => {
    const user = userEvent.setup();
    render(<ClaudeChat />);

    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Feature Assistant')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Feature Assistant')).not.toBeInTheDocument();
    });
  });

  it('should display loading state', async () => {
    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      loading: true,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /^(?!.*close|new conversation).*/i });
      expect(sendButton).toBeDisabled();
    });
  });

  it('should display error message', async () => {
    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      error: 'Failed to send message',
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    });
  });

  it('should start a new conversation', async () => {
    const user = userEvent.setup();
    const startNewMock = jest.fn();

    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Previous message',
          createdAt: new Date().toISOString(),
        },
      ],
      startNewConversation: startNewMock,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const newButton = screen.getByLabelText('New conversation');
    await user.click(newButton);

    expect(startNewMock).toHaveBeenCalled();
  });

  it('should show new conversation button only when messages exist', async () => {
    const { rerender } = render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    // Initially no new conversation button
    expect(screen.queryByLabelText('New conversation')).not.toBeInTheDocument();

    // Add messages and rerender
    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Test',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    rerender(<ClaudeChat />);

    // Now button should appear
    expect(screen.getByLabelText('New conversation')).toBeInTheDocument();
  });

  it('should handle create field action', async () => {
    const user = userEvent.setup();
    const createFieldMock = jest.fn().mockResolvedValue({});
    const sendMessageMock = jest.fn().mockResolvedValue({});

    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'I can create a field for you',
          createdAt: new Date().toISOString(),
          actions: {
            shouldCreateField: true,
            fieldSuggestion: {
              name: 'certifications',
              type: 'text',
              entityType: 'employee',
            },
          },
        },
      ],
      createCustomField: createFieldMock,
      sendMessage: sendMessageMock,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const createButton = screen.getByText('Create This Field');
    await user.click(createButton);

    await waitFor(() => {
      expect(createFieldMock).toHaveBeenCalled();
    });
  });

  it('should disable send button when loading', () => {
    jest.spyOn(useClaudeChatModule, 'useClaudeChat').mockReturnValue({
      ...mockUseClaudeChat,
      loading: true,
    });

    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Describe what you need...');
    expect(input).toBeDisabled();
  });

  it('should disable send button when input is empty', () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    const sendButtons = screen.getAllByRole('button');
    const sendBtn = sendButtons.find((btn) => btn.textContent.includes('Send'));
    expect(sendBtn).toBeDisabled();
  });

  it('should focus input when chat opens', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Describe what you need...');
      expect(input).toHaveFocus();
    });
  });
});
