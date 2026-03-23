/**
 * TopBar Component Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopBar from '../../components/TopBar';

// Mock the useNotifications hook
jest.mock('../../hooks/useNotifications');

describe('TopBar Component', () => {
  const mockOnMenuClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('../../hooks/useNotifications').default.mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'task_assignment',
          description: 'You have been assigned a new task',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'task_due',
          description: 'Task is due tomorrow',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      loading: false,
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    });
  });

  test('renders top bar with all sections', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(screen.getByPlaceholderText(/Search people/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle menu/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notifications/ })).toBeInTheDocument();
  });

  test('displays user avatar', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(screen.getByText('VO')).toBeInTheDocument();
  });

  test('calls onMenuClick when menu button is clicked', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /Toggle menu/ });
    fireEvent.click(menuButton);

    expect(mockOnMenuClick).toHaveBeenCalled();
  });

  test('displays notification bell button', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(screen.getByRole('button', { name: /Notifications/ })).toBeInTheDocument();
  });

  test('shows unread badge with count', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('shows 9+ when unread count exceeds 9', () => {
    const useNotifications = require('../../hooks/useNotifications').default;
    useNotifications.mockReturnValue({
      notifications: Array(15)
        .fill(null)
        .map((_, i) => ({
          id: String(i),
          type: 'task_assignment',
          description: `Task ${i}`,
          read: false,
          createdAt: new Date().toISOString(),
        })),
      loading: false,
      unreadCount: 15,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  test('does not show badge when unread count is 0', () => {
    const useNotifications = require('../../hooks/useNotifications').default;
    useNotifications.mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'task_assignment',
          description: 'Task',
          read: true,
          createdAt: new Date().toISOString(),
        },
      ],
      loading: false,
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('opens dropdown when bell is clicked', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('closes dropdown when bell is clicked again', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });

    // Open
    fireEvent.click(bellButton);
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Close
    fireEvent.click(bellButton);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  test('displays notification dropdown with notifications', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });
    fireEvent.click(bellButton);

    expect(
      screen.getByText('You have been assigned a new task')
    ).toBeInTheDocument();
    expect(screen.getByText('Task is due tomorrow')).toBeInTheDocument();
  });

  test('marks notification as read when clicked', () => {
    const mockMarkAsRead = jest.fn();
    const useNotifications = require('../../hooks/useNotifications').default;

    useNotifications.mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'task_assignment',
          description: 'You have been assigned a new task',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      loading: false,
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });
    fireEvent.click(bellButton);

    const notification = screen.getByText(
      'You have been assigned a new task'
    ).closest('li');
    fireEvent.click(notification);

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  test('closes dropdown after clicking notification', async () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });
    fireEvent.click(bellButton);

    const notification = screen.getByText(
      'You have been assigned a new task'
    ).closest('li');
    fireEvent.click(notification);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  test('shows loading state in dropdown', () => {
    const useNotifications = require('../../hooks/useNotifications').default;
    useNotifications.mockReturnValue({
      notifications: [],
      loading: true,
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });
    fireEvent.click(bellButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows empty state when no notifications', () => {
    const useNotifications = require('../../hooks/useNotifications').default;
    useNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    });

    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });
    fireEvent.click(bellButton);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  test('bell button has correct aria attributes', () => {
    render(<TopBar onMenuClick={mockOnMenuClick} />);

    const bellButton = screen.getByRole('button', { name: /Notifications/ });

    // Initially closed
    expect(bellButton).toHaveAttribute('aria-expanded', 'false');

    // After click, opened
    fireEvent.click(bellButton);
    expect(bellButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('uses provided employeeId for notifications', () => {
    const useNotifications = require('../../hooks/useNotifications').default;

    render(<TopBar onMenuClick={mockOnMenuClick} employeeId="emp123" />);

    expect(useNotifications).toHaveBeenCalledWith('emp123');
  });

  test('uses default employeeId if not provided', () => {
    const useNotifications = require('../../hooks/useNotifications').default;

    render(<TopBar onMenuClick={mockOnMenuClick} />);

    expect(useNotifications).toHaveBeenCalledWith('default-employee');
  });
});
