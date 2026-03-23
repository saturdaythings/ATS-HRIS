import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
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
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Center: Global search */}
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          placeholder="Search people, devices, activities..."
          className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          disabled
        />
      </div>

      {/* Right: User avatar */}
      <div className="flex items-center gap-4">
        {/* Notification bell with dropdown */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
            aria-expanded={isDropdownOpen}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
          <span className="text-sm font-semibold text-purple-900">VO</span>
        </div>
      </div>
    </div>
  );
}
