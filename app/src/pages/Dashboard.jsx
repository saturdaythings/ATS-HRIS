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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to V.Two Ops - Phase 2 Implementation</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Employees', value: 'TBD', icon: '👥' },
          { label: 'Candidates', value: 'TBD', icon: '📋' },
          { label: 'Devices', value: 'TBD', icon: '🖥️' },
          { label: 'Unassigned', value: 'TBD', icon: '📦' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-medium">{card.label}</h3>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">Coming in Phase 2</p>
          </div>
        ))}
      </div>

      {/* Activity Feed Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <ActivityFeed
            activities={activities}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-semibold text-blue-900 mb-3">Phase 2 Status</h2>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Activity Feed widget added</li>
            <li>✓ Timeline visualization</li>
            <li>✓ Type filtering (hire, offboard, device, task)</li>
            <li>✓ Search functionality</li>
            <li>✓ Pagination with load more</li>
            <li>→ Phase 3: Real-time updates</li>
            <li>→ Phase 4: Analytics & insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
