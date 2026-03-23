/**
 * useNotifications Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import useNotifications from '../../hooks/useNotifications';

describe('useNotifications Hook', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'task_assignment',
      description: 'You have been assigned a new task',
      read: false,
      employeeId: 'emp1',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'task_due',
      description: 'Task is due tomorrow',
      read: false,
      employeeId: 'emp1',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'completion',
      description: 'Your task was completed',
      read: true,
      employeeId: 'emp1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with loading state', () => {
    const { result } = renderHook(() => useNotifications('emp1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  test('fetches notifications on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNotifications,
    });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notifications/emp1')
    );
    expect(result.current.notifications).toEqual(mockNotifications);
  });

  test('calculates unread count correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNotifications,
    });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(2);
  });

  test('marks a notification as read', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotifications,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockNotifications[0], read: true }),
      });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.markAsRead('1');
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notifications/1',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  test('marks all notifications as read', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotifications,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Marked 2 notifications as read',
          count: 2,
        }),
      });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.markAllAsRead();
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(0);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notifications/read-all/emp1',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  test('deletes a notification', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotifications,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.deleteNotification('1');
    });

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notifications/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.notifications).toEqual([]);
  });

  test('handles API error response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.notifications).toEqual([]);
  });

  test('does not fetch if employeeId is missing', () => {
    const { result } = renderHook(() => useNotifications(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.notifications).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('refetch function re-fetches notifications', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockNotifications,
    });

    const { result } = renderHook(() => useNotifications('emp1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('passes limit and offset to API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNotifications,
    });

    renderHook(() => useNotifications('emp1', { limit: 10, offset: 5 }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10') &&
        expect.stringContaining('offset=5')
      );
    });
  });
});
