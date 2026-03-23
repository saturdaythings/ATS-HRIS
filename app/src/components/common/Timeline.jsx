/**
 * Timeline Component - Activity timeline visualization
 * Used in detail panel history tabs
 */
export default function Timeline({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, idx) => (
        <div key={activity.id || idx} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100" />
            {idx < activities.length - 1 && (
              <div className="w-0.5 h-12 bg-slate-200 my-2" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 flex-1">
            <p className="text-sm font-medium text-slate-900">{activity.action}</p>
            {activity.description && (
              <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Unknown date'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
