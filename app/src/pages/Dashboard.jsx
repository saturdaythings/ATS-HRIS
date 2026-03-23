import { useEffect } from 'react';
import { useActivities } from '../hooks/useActivities';
import ActivityFeed from '../components/ActivityFeed';

export default function Dashboard() {
  const { activities, loading, error, hasMore, fetchActivities, loadMore } = useActivities();

  useEffect(() => {
    // Fetch initial activities
    fetchActivities({ limit: 20 });
  }, []);

  const handleLoadMore = () => {
    loadMore({ limit: 20 });
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">Dashboard</h1>
      <p className="text-neutral-600 mb-8 text-lg">Welcome to V.Two Ops - Phase 2 Implementation</p>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Employees', value: 'TBD', icon: '👥' },
          { label: 'Candidates', value: 'TBD', icon: '📋' },
          { label: 'Devices', value: 'TBD', icon: '🖥️' },
          { label: 'Unassigned', value: 'TBD', icon: '📦' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-fast"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-700 font-semibold text-sm">{card.label}</h3>
              <span className="text-2xl" aria-hidden="true">
                {card.icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-xs text-neutral-500 mt-2">Coming in Phase 2</p>
          </div>
        ))}
      </div>

      {/* Activity Feed Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <ActivityFeed
            activities={activities}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>

        {/* Info Panel */}
        <div className="bg-info-50 border border-info-200 rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold text-info-900 mb-3 text-lg">Phase 2 Status</h2>
          <ul className="text-sm text-info-800 space-y-2" role="list">
            <li>✓ Activity Feed widget added</li>
            <li>✓ Timeline visualization</li>
            <li>✓ Type filtering (hire, offboard, device, task)</li>
            <li>✓ Search functionality</li>
            <li>✓ Pagination with load more</li>
            <li className="text-info-700 font-medium">→ Phase 3: Real-time updates</li>
            <li className="text-info-700 font-medium">→ Phase 4: Analytics & insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
