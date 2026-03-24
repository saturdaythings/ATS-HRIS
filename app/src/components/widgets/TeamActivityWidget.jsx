import { useEffect, useState } from 'react';

/**
 * TeamActivityWidget - Shows recent team actions and activity summary
 */
export default function TeamActivityWidget() {
  const [data, setData] = useState({
    recentActions: [],
    activityByType: {},
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/widgets/team-activity');
      if (!response.ok) throw new Error('Failed to fetch team activity');
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-neutral-500">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const activityIcons = {
    hire: '🎉',
    onboarding: '🚀',
    device: '🖥️',
    task: '✓',
    promotion: '⬆️',
    offer: '📬',
    interview: '👥',
    rejection: '✗',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor((now - date) / (1000 * 60));
      return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
    }
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Team Activity</h3>

      {data.totalActivities > 0 && (
        <div className="mb-4 text-sm text-neutral-500">
          {data.totalActivities} actions in the last 7 days
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.recentActions.length > 0 ? (
          data.recentActions.map((action, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition">
              <span className="text-xl" aria-hidden="true">
                {activityIcons[action.type] || '📌'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  {action.description}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatDate(action.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500 py-4">No recent activities</p>
        )}
      </div>

      {Object.keys(data.activityByType).length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-xs font-semibold text-neutral-700 mb-2">Activity Types</p>
          <div className="space-y-1">
            {Object.entries(data.activityByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">{type}</span>
                <span className="font-semibold text-neutral-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
