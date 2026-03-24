import { useEffect, useState } from 'react';

/**
 * CandidateStageWidget - Shows distribution of candidates across pipeline stages
 */
export default function CandidateStageWidget() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/widgets/candidate-stage');
      if (!response.ok) throw new Error('Failed to fetch candidate stage data');
      const result = await response.json();

      // Calculate percentages
      const total = result.data.reduce((sum, item) => sum + item.count, 0);
      const withPercentages = result.data.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      }));

      setData(withPercentages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-neutral-500">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const stageLabels = {
    applied: 'Applied',
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    closed: 'Closed',
  };

  const stageColors = {
    applied: '#3B82F6',
    screening: '#8B5CF6',
    interview: '#EC4899',
    offer: '#10B981',
    closed: '#6B7280',
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pipeline Stages</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">
                {stageLabels[item.stage] || item.stage}
              </span>
              <span className="text-sm text-neutral-500">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: stageColors[item.stage] || '#6B7280',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
