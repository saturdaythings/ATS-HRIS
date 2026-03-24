import { useEffect, useState } from 'react';

/**
 * DeviceInventoryWidget - Shows device availability and status
 */
export default function DeviceInventoryWidget() {
  const [data, setData] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    retired: 0,
    byStatus: {},
    byType: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/widgets/device-inventory');
      if (!response.ok) throw new Error('Failed to fetch device inventory');
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

  const statusStats = [
    { label: 'Available', value: data.available, color: 'text-emerald-600' },
    { label: 'Assigned', value: data.assigned, color: 'text-blue-600' },
    { label: 'Retired', value: data.retired, color: 'text-neutral-500' },
  ];

  const utilizationPercent = data.total > 0
    ? Math.round((data.assigned / data.total) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Device Inventory</h3>

      <div className="mb-6">
        <div className="text-3xl font-bold text-neutral-900">{data.total}</div>
        <p className="text-sm text-neutral-500">Total devices</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Utilization</span>
          <span className="text-sm text-neutral-500">{utilizationPercent}%</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${utilizationPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {statusStats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">{stat.label}</span>
            <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
