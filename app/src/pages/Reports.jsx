import { useState, useEffect } from 'react';

export default function Reports() {
  const [stats, setStats] = useState({
    candidates: 0,
    employees: 0,
    devices: 0,
    activities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch summary stats from endpoints
        const [candidatesRes, employeesRes, devicesRes, activitiesRes] = await Promise.all([
          fetch('/api/candidates?limit=1&offset=0'),
          fetch('/api/employees?limit=1&offset=0'),
          fetch('/api/devices?limit=1&offset=0'),
          fetch('/api/activities?limit=1&offset=0'),
        ]);

        if (candidatesRes.ok) {
          const data = await candidatesRes.json();
          setStats(prev => ({ ...prev, candidates: data.total || 0 }));
        }
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          setStats(prev => ({ ...prev, employees: data.total || 0 }));
        }
        if (devicesRes.ok) {
          const data = await devicesRes.json();
          setStats(prev => ({ ...prev, devices: data.total || 0 }));
        }
        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          setStats(prev => ({ ...prev, activities: data.total || 0 }));
        }

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleExport = async (type) => {
    try {
      const response = await fetch(`/api/exports/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: {}, columns: null }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const reports = [
    {
      id: 'candidates',
      title: 'Candidate Pipeline',
      description: 'Overview of all candidates and recruitment progress',
      stat: stats.candidates,
      icon: '👥',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'employees',
      title: 'Employee Directory',
      description: 'Current headcount and department breakdown',
      stat: stats.employees,
      icon: '👔',
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 'devices',
      title: 'Device Inventory',
      description: 'Equipment and asset allocation',
      stat: stats.devices,
      icon: '💻',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'activity',
      title: 'Activity Log',
      description: 'System-wide action history and audit trail',
      stat: stats.activities,
      icon: '📋',
      color: 'bg-orange-50 border-orange-200',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">View insights and export data</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading stats: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">
        {reports.map(report => (
          <div
            key={report.id}
            className={`${report.color} rounded-lg border p-6 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{report.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-3xl font-bold text-gray-900">
                {loading ? '—' : report.stat}
              </div>
              <button
                onClick={() => handleExport(report.id)}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
                disabled={loading}
              >
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h2>
          <p className="text-sm text-gray-600 mb-4">
            Export all data types at once for analysis and reporting
          </p>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/exports/bulk', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    types: ['candidates', 'employees', 'devices', 'activity'],
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  // Convert to JSON download for now (can be enhanced to create multiple CSVs)
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `bulk-export-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  window.URL.revokeObjectURL(url);
                }
              } catch (err) {
                console.error('Bulk export failed:', err);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Download All Data
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Records</span>
              <span className="font-semibold">
                {loading ? '—' : stats.candidates + stats.employees + stats.devices}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Activities</span>
              <span className="font-semibold">
                {loading ? '—' : stats.activities}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Device Utilization</span>
              <span className="font-semibold">
                {loading ? '—' : `${stats.devices}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
