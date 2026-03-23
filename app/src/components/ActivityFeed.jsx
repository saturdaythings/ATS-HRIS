import { useMemo, useState } from 'react';

/**
 * Activity type icon and color configuration
 */
const ACTIVITY_CONFIG = {
  hire: {
    icon: '🎉',
    label: 'Hired',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-50',
  },
  offboard: {
    icon: '👋',
    label: 'Offboarded',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-50',
  },
  device_assign: {
    icon: '💻',
    label: 'Device Assigned',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-50',
  },
  device_return: {
    icon: '↩️',
    label: 'Device Returned',
    color: 'bg-gray-100 text-gray-800',
    bgColor: 'bg-gray-50',
  },
  task_complete: {
    icon: '✅',
    label: 'Task Completed',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-50',
  },
  task_overdue: {
    icon: '⚠️',
    label: 'Task Overdue',
    color: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-yellow-50',
  },
  resume_uploaded: {
    icon: '📄',
    label: 'Resume Uploaded',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-50',
  },
  stage_change: {
    icon: '📊',
    label: 'Stage Changed',
    color: 'bg-indigo-100 text-indigo-800',
    bgColor: 'bg-indigo-50',
  },
};

/**
 * Format time ago display
 */
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return 'Just now';
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Activity item component
 */
function ActivityItem({ activity, config, isLeft, isLast }) {
  const timeAgo = formatTimeAgo(activity.createdAt);

  return (
    <div className="flex gap-4 relative">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ring-4 ring-white ${config.color.split(' ')[0]}`}
        />
        {!isLast && <div className="absolute top-3 bottom-0 w-0.5 bg-gray-200" />}
      </div>

      {/* Activity content */}
      <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
        <div className={`p-3 rounded-lg ${config.bgColor}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{config.icon}</span>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {config.label}
                </h3>
              </div>
              <p className="text-gray-700 text-sm break-words">
                {activity.description}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Activity Feed Component
 * Displays recent activities with timeline visualization and filtering
 */
export default function ActivityFeed({
  activities = [],
  loading = false,
  error = null,
  onLoadMore = null,
  hasMore = false,
  onFilterChange = null,
}) {
  const [selectedType, setSelectedType] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Get unique activity types
  const activityTypes = useMemo(() => {
    const types = activities
      .map((a) => a.type)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    return types.sort();
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Type filter
      if (selectedType && activity.type !== selectedType) {
        return false;
      }

      // Text search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const description = activity.description.toLowerCase();
        return description.includes(searchLower);
      }

      return true;
    });
  }, [activities, selectedType, searchText]);

  // Handle filter changes
  const handleTypeFilter = (type) => {
    const newType = selectedType === type ? null : type;
    setSelectedType(newType);
    if (onFilterChange) {
      onFilterChange({ type: newType, search: searchText });
    }
  };

  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    if (onFilterChange) {
      onFilterChange({ type: selectedType, search: text });
    }
  };

  const handleLoadMore = () => {
    if (onLoadMore && hasMore && !loading) {
      onLoadMore();
    }
  };

  // Loading state
  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && activities.length === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">
          <strong>Error:</strong> {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm mb-2">📭 No activities found</p>
        {(selectedType || searchText) && (
          <button
            onClick={() => {
              setSelectedType(null);
              setSearchText('');
              if (onFilterChange) {
                onFilterChange({ type: null, search: '' });
              }
            }}
            className="text-blue-600 hover:text-blue-700 text-xs underline"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h2>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchText}
            onChange={handleSearch}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type filters */}
        {activityTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => {
              const config = ACTIVITY_CONFIG[type] || {
                icon: '•',
                label: type,
                color: 'bg-gray-100 text-gray-800',
              };

              return (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedType === type
                      ? config.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-0">
          {filteredActivities.map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.type] || {
              icon: '•',
              label: activity.type,
              color: 'bg-gray-100 text-gray-800',
              bgColor: 'bg-gray-50',
            };

            return (
              <ActivityItem
                key={activity.id}
                activity={activity}
                config={config}
                isLeft={index % 2 === 0}
                isLast={index === filteredActivities.length - 1}
              />
            );
          })}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-4 border-t pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Load More Activities'}
          </button>
        </div>
      )}
    </div>
  );
}
