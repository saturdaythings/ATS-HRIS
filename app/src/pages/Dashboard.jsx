import { useEffect, useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import ActivityFeed from '../components/ActivityFeed';
import MetricsCard from '../components/widgets/MetricsCard';
import CandidateStageWidget from '../components/widgets/CandidateStageWidget';
import OnboardingProgressWidget from '../components/widgets/OnboardingProgressWidget';
import DeviceInventoryWidget from '../components/widgets/DeviceInventoryWidget';
import TeamActivityWidget from '../components/widgets/TeamActivityWidget';

export default function Dashboard() {
  const { activities, loading, error, hasMore, fetchActivities, loadMore } = useActivities();
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  useEffect(() => {
    // Fetch metrics
    fetchMetrics();
    // Fetch initial activities
    fetchActivities({ limit: 20 });
  }, []);

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const result = await response.json();
      setMetrics(result.data);
    } catch (err) {
      setMetricsError(err.message);
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadMore({ limit: 20 });
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">Dashboard</h1>
      <p className="text-neutral-600 mb-8 text-lg">Real-time metrics and activity overview</p>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsLoading ? (
          <div className="col-span-full text-neutral-500">Loading metrics...</div>
        ) : metricsError ? (
          <div className="col-span-full text-red-600">Error loading metrics: {metricsError}</div>
        ) : metrics ? (
          <>
            <MetricsCard
              label="Active Candidates"
              value={metrics.candidatesInPipeline}
              icon="📋"
              color="info"
            />
            <MetricsCard
              label="In Pipeline"
              value={metrics.openPositions}
              icon="🎯"
              color="info"
            />
            <MetricsCard
              label="Onboarding"
              value={metrics.onboardingInProgress}
              icon="🚀"
              color="warning"
            />
            <MetricsCard
              label="Devices"
              value={metrics.deviceInventory.total}
              icon="🖥️"
              color="neutral"
            />
          </>
        ) : null}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CandidateStageWidget />
        </div>
        <div>
          <OnboardingProgressWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DeviceInventoryWidget />
        <TeamActivityWidget />
      </div>

      {/* Activity Feed Widget */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Activity Feed</h2>
          <ActivityFeed
            activities={activities}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  );
}
