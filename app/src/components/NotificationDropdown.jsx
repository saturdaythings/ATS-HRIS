import { useEffect, useRef } from 'react';

/**
 * Notification type icons and labels
 */
const NOTIFICATION_ICONS = {
  task_assignment: '📋',
  task_due: '⏰',
  task_overdue: '⚠️',
  employee_hired: '🎉',
  completion: '✅',
  device_assigned: '💻',
};

const NOTIFICATION_LABELS = {
  task_assignment: 'Task Assignment',
  task_due: 'Task Due Soon',
  task_overdue: 'Task Overdue',
  employee_hired: 'Employee Hired',
  completion: 'Completion',
  device_assigned: 'Device Assigned',
};

/**
 * Format time difference (e.g., "5 minutes ago")
 */
function formatTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

/**
 * NotificationDropdown Component
 * Displays a dropdown list of notifications with mark-as-read functionality
 */
export default function NotificationDropdown({
  isOpen,
  notifications = [],
  loading = false,
  onMarkAsRead,
  onClose,
  onSeeAll,
}) {
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sort notifications: unread first, then by date
  const sorted = [...notifications].sort((a, b) => {
    if (a.read === b.read) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.read ? 1 : -1;
  });

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No notifications</div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sorted.map((notification) => (
              <li
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-purple-50' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                  onClose();
                }}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="text-xl flex-shrink-0">
                    {NOTIFICATION_ICONS[notification.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {NOTIFICATION_LABELS[notification.type] || 'Notification'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {sorted.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              onSeeAll();
              onClose();
            }}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            See all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
