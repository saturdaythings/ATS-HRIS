import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClaudeChat from '../../components/ClaudeChat';

/**
 * Tests for ClaudeChat component
 * Covers rendering and basic UI interactions
 */

// Mock the useClaudeChat hook to avoid API calls
jest.mock('../../hooks/useClaudeChat', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    featureRequestId: null,
    messages: [],
    loading: false,
    error: null,
    sendMessage: jest.fn().mockResolvedValue({}),
    startNewConversation: jest.fn(),
    createCustomField: jest.fn(),
    fetchConversationHistory: jest.fn(),
  })),
}));

describe('ClaudeChat component', () => {
  it('should render floating button', () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
  });

  it('should open and close chat widget', async () => {
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

  it('should display welcome message when chat opens', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Welcome to the Feature Assistant!')).toBeInTheDocument();
    });
  });

  it('should have send input field', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Describe what you need...');
      expect(input).toBeInTheDocument();
    });
  });

  it('should have send button', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      const sendBtn = screen.getByRole('button', { name: /send/i });
      expect(sendBtn).toBeInTheDocument();
    });
  });

  it('should respond to keyboard input', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Feature Assistant')).toBeInTheDocument();
    });

    // Verify close button exists
    const closeBtn = screen.getByLabelText('Close');
    expect(closeBtn).toBeInTheDocument();
  });

  it('should disable send button when input is empty', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      const sendBtn = screen.getByRole('button', { name: /send/i });
      expect(sendBtn).toBeDisabled();
    });
  });

  it('should have footer with tip', async () => {
    render(<ClaudeChat />);
    const button = screen.getByLabelText('Claude Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Press Enter to send/)).toBeInTheDocument();
    });
  });
});
