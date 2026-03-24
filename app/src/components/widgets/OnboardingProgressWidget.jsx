import { useEffect, useState } from 'react';

/**
 * OnboardingProgressWidget - Shows onboarding runs in progress and completion status
 */
export default function OnboardingProgressWidget() {
  const [data, setData] = useState({
    inProgress: 0,
    complete: 0,
    pending: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/widgets/onboarding-progress');
      if (!response.ok) throw new Error('Failed to fetch onboarding data');
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

  const stats = [
    { label: 'In Progress', value: data.inProgress, color: 'text-blue-600' },
    { label: 'Completed', value: data.complete, color: 'text-emerald-600' },
    { label: 'Pending', value: data.pending, color: 'text-amber-600' },
  ];

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Onboarding Progress</h3>

      <div className="mb-6">
        <div className="text-3xl font-bold text-neutral-900">{data.total}</div>
        <p className="text-sm text-neutral-500">Total runs</p>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">{stat.label}</span>
            <span className={`text-lg font-semibold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
