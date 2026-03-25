import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import AssistantPanel from './panels/AssistantPanel';
import useNotifications from '../hooks/useNotifications';

export default function TopBar({ onMenuClick, employeeId = 'default-employee' }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { notifications, loading, unreadCount, markAsRead } = useNotifications(
    employeeId
  );

  const handleNotificationClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleSeeAll = () => {
    // Navigate to notifications center (stub for now)
    console.log('Navigate to notifications center');
  };

  return (
    <div className="h-16 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left: Menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-neutral-100 rounded-md transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-600"
        aria-label="Toggle navigation menu"
      >
        <svg
          className="w-6 h-6 text-neutral-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Center: Global search */}
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          placeholder="Search people, devices, activities..."
          className="w-full px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-md text-sm text-neutral-700 placeholder-neutral-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 transition-all duration-fast"
          disabled
          aria-label="Global search"
        />
      </div>

      {/* Right: Assistant button and user avatar */}
      <div className="flex items-center gap-4">
        {/* Assistant Panel */}
        <AssistantPanel />

        {/* Notification bell with dropdown */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-neutral-100 rounded-md transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-600"
            aria-label="Notifications"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          <NotificationDropdown
            isOpen={isDropdownOpen}
            notifications={notifications}
            loading={loading}
            onMarkAsRead={handleMarkAsRead}
            onClose={() => setIsDropdownOpen(false)}
            onSeeAll={handleSeeAll}
          />
        </div>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center cursor-pointer hover:bg-primary-300 transition-colors duration-fast"
          title="User profile"
        >
          <span className="text-sm font-semibold text-primary-900">VO</span>
        </div>
      </div>
    </div>
  );
}
