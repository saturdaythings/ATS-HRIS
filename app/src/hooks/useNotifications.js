import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing notifications
 * Handles fetching, marking as read, and deleting notifications
 */
export function useNotifications(employeeId, options = {}) {
  const { autoRefresh = false, refreshInterval = 30000, limit = 25, offset = 0 } = options;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(
    async (filters = {}) => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: filters.limit || limit,
          offset: filters.offset || offset,
        });

        if (filters.read !== undefined) {
          params.append('read', filters.read);
        }

        const response = await fetch(
          `/api/notifications/${employeeId}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data = await response.json();
        setNotifications(data);
        setError(null);

        // Calculate unread count
        const unread = data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        setError(err.message);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    },
    [employeeId, limit, offset]
  );

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'PATCH',
        });

        if (!response.ok) {
          throw new Error(`Failed to mark notification as read: ${response.status}`);
        }

        const updated = await response.json();

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? updated : n))
        );

        // Recalculate unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        setError(err.message);
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(
    async () => {
      if (!employeeId) return;

      try {
        const response = await fetch(
          `/api/notifications/read-all/${employeeId}`,
          {
            method: 'PATCH',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to mark all as read: ${response.status}`);
        }

        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } catch (err) {
        setError(err.message);
      }
    },
    [employeeId]
  );

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete notification: ${response.status}`);
        }

        // Update local state
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== notificationId);

          // Recalculate unread count
          const unread = filtered.filter((n) => !n.read).length;
          setUnreadCount(unread);

          return filtered;
        });
      } catch (err) {
        setError(err.message);
      }
    },
    []
  );

  /**
   * Refetch notifications
   */
  const refetch = useCallback(() => {
    fetchNotifications({ limit, offset });
  }, [fetchNotifications, limit, offset]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications({ limit, offset });
  }, [employeeId]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !employeeId) return;

    const interval = setInterval(() => {
      fetchNotifications({ limit, offset });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, employeeId, refreshInterval, limit, offset, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  };
}

export default useNotifications;
