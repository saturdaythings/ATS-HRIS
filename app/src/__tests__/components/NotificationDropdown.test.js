/**
 * NotificationDropdown Component Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationDropdown from '../../components/NotificationDropdown';

describe('NotificationDropdown Component', () => {
  const mockNotifications = [
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
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'completion',
      description: 'Your task was completed',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const defaultProps = {
    isOpen: true,
    notifications: mockNotifications,
    loading: false,
    onMarkAsRead: jest.fn(),
    onClose: jest.fn(),
    onSeeAll: jest.fn(),
  };

  test('does not render when closed', () => {
    render(<NotificationDropdown {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  test('renders notification list when open', () => {
    render(<NotificationDropdown {...defaultProps} />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('You have been assigned a new task')).toBeInTheDocument();
    expect(screen.getByText('Task is due tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Your task was completed')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<NotificationDropdown {...defaultProps} loading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows empty state when no notifications', () => {
    render(
      <NotificationDropdown {...defaultProps} notifications={[]} />
    );

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  test('displays unread notifications first', () => {
    const { container } = render(
      <NotificationDropdown {...defaultProps} />
    );

    const items = container.querySelectorAll('li');
    // First two should be unread (have purple background)
    expect(items[0]).toHaveClass('bg-purple-50');
    expect(items[1]).toHaveClass('bg-purple-50');
  });

  test('shows unread indicator on unread notifications', () => {
    const { container } = render(
      <NotificationDropdown {...defaultProps} />
    );

    const unreadIndicators = container.querySelectorAll(
      'div.w-2.h-2.rounded-full.bg-purple-600'
    );
    // Should have 2 unread notifications
    expect(unreadIndicators.length).toBe(2);
  });

  test('calls onMarkAsRead when clicking unread notification', () => {
    render(<NotificationDropdown {...defaultProps} />);

    const unreadNotification = screen.getByText(
      'You have been assigned a new task'
    ).closest('li');

    fireEvent.click(unreadNotification);

    expect(defaultProps.onMarkAsRead).toHaveBeenCalledWith('1');
  });

  test('does not call onMarkAsRead when clicking read notification', () => {
    const mockOnMarkAsRead = jest.fn();
    render(
      <NotificationDropdown
        {...defaultProps}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const readNotification = screen.getByText(
      'Your task was completed'
    ).closest('li');

    fireEvent.click(readNotification);

    expect(mockOnMarkAsRead).not.toHaveBeenCalled();
  });

  test('closes dropdown when clicking notification', () => {
    const mockOnClose = jest.fn();
    render(
      <NotificationDropdown {...defaultProps} onClose={mockOnClose} />
    );

    const notification = screen.getByText(
      'You have been assigned a new task'
    ).closest('li');

    fireEvent.click(notification);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays correct notification type labels', () => {
    render(<NotificationDropdown {...defaultProps} />);

    expect(screen.getByText('Task Assignment')).toBeInTheDocument();
    expect(screen.getByText('Task Due Soon')).toBeInTheDocument();
    expect(screen.getByText('Completion')).toBeInTheDocument();
  });

  test('displays notification icons', () => {
    const { container } = render(
      <NotificationDropdown {...defaultProps} />
    );

    // Check for emoji icons
    expect(container.textContent).toContain('📋'); // task_assignment
    expect(container.textContent).toContain('⏰'); // task_due
    expect(container.textContent).toContain('✅'); // completion
  });

  test('displays time ago', () => {
    render(<NotificationDropdown {...defaultProps} />);

    expect(screen.getByText(/just now/)).toBeInTheDocument();
    expect(screen.getByText(/hour ago/)).toBeInTheDocument();
    expect(screen.getByText(/day ago/)).toBeInTheDocument();
  });

  test('displays see all link when notifications exist', () => {
    render(<NotificationDropdown {...defaultProps} />);

    expect(screen.getByText(/See all notifications/)).toBeInTheDocument();
  });

  test('calls onSeeAll when clicking see all link', () => {
    const mockOnSeeAll = jest.fn();
    render(
      <NotificationDropdown {...defaultProps} onSeeAll={mockOnSeeAll} />
    );

    const seeAllButton = screen.getByText(/See all notifications/);
    fireEvent.click(seeAllButton);

    expect(mockOnSeeAll).toHaveBeenCalled();
  });

  test('closes dropdown when clicking see all link', () => {
    const mockOnClose = jest.fn();
    render(
      <NotificationDropdown {...defaultProps} onClose={mockOnClose} />
    );

    const seeAllButton = screen.getByText(/See all notifications/);
    fireEvent.click(seeAllButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('hides see all footer when no notifications', () => {
    render(
      <NotificationDropdown {...defaultProps} notifications={[]} />
    );

    expect(screen.queryByText(/See all notifications/)).not.toBeInTheDocument();
  });

  test('closes dropdown on click outside', () => {
    const mockOnClose = jest.fn();
    const { container } = render(
      <div>
        <div data-testid="outside">Outside element</div>
        <NotificationDropdown {...defaultProps} onClose={mockOnClose} />
      </div>
    );

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('does not close dropdown on click inside', () => {
    const mockOnClose = jest.fn();
    render(
      <NotificationDropdown {...defaultProps} onClose={mockOnClose} />
    );

    const notification = screen.getByText(
      'You have been assigned a new task'
    ).closest('li');

    fireEvent.click(notification);

    // Should be called once (from the notification click which closes it)
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles notifications without type gracefully', () => {
    const notificationsWithMissingType = [
      {
        id: '1',
        type: undefined,
        description: 'Unknown notification',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    render(
      <NotificationDropdown
        {...defaultProps}
        notifications={notificationsWithMissingType}
      />
    );

    expect(screen.getByText('Unknown notification')).toBeInTheDocument();
    expect(screen.getByText('🔔')).toBeInTheDocument(); // Default icon
  });

  test('truncates long descriptions', () => {
    const longNotifications = [
      {
        id: '1',
        type: 'task_assignment',
        description:
          'This is a very long notification description that should be truncated to prevent the dropdown from becoming too wide',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const { container } = render(
      <NotificationDropdown
        {...defaultProps}
        notifications={longNotifications}
      />
    );

    const description = container.querySelector('p.line-clamp-2');
    expect(description).toBeInTheDocument();
  });

  test('renders with correct ARIA attributes', () => {
    const { container } = render(
      <NotificationDropdown {...defaultProps} />
    );

    const dropdown = container.querySelector('div[class*="absolute"]');
    expect(dropdown).toHaveClass('z-50');
  });
});
