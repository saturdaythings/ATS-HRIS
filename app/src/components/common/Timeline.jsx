/**
 * Timeline Component - Activity timeline visualization
 * Used in detail panel history tabs
 * Provides proper vertical alignment, spacing, and accessibility
 */
export default function Timeline({ activities = [], variant = 'default', className = '' }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <p className="text-neutral-500">No activities yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="log" aria-label="Activity timeline">
      {activities.map((activity, idx) => (
        <div key={activity.id || idx} className="flex gap-4">
          {/* Timeline dot and connector */}
          <div className="flex flex-col items-center pt-1">
            <div
              className="w-3 h-3 rounded-full bg-primary-600 ring-4 ring-primary-50 flex-shrink-0"
              aria-hidden="true"
            />
            {idx < activities.length - 1 && (
              <div className="w-0.5 h-12 bg-neutral-200 my-2 flex-shrink-0" aria-hidden="true" />
            )}
          </div>

          {/* Activity Content */}
          <div className="pb-4 flex-1">
            <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
            {activity.description && (
              <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
            )}
            <time className="text-xs text-neutral-500 mt-2 block font-medium">
              {activity.timestamp
                ? new Date(activity.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : 'Unknown date'}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}
