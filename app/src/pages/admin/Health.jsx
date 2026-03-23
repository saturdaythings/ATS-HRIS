import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';

export default function Health() {
  const { getSystemHealth, loading } = useAdmin();

  const [health, setHealth] = useState(null);
  const [message, setMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const data = await getSystemHealth();
      setHealth(data.health || {});
      setLastRefresh(new Date());
    } catch (err) {
      setMessage(`Error loading health: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600';
      case 'unhealthy':
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'bg-green-100';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100';
      case 'unhealthy':
      case 'down':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health</h1>
        <p className="text-gray-600">Monitor system status, performance, and recent activities</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800">{message}</div>
      )}

      {/* Refresh Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={loadHealth}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Refreshing...' : 'Refresh Now'}
        </button>
        <p className="text-xs text-gray-500">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {!health ? (
        <div className="text-center p-8 text-gray-500">Loading health information...</div>
      ) : (
        <div className="space-y-8">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">API Server</h2>
              <div className={`p-4 rounded-lg ${getStatusBg(health.apiStatus || 'unknown')}`}>
                <p className={`font-semibold ${getStatusColor(health.apiStatus || 'unknown')}`}>
                  {health.apiStatus ? health.apiStatus.charAt(0).toUpperCase() + health.apiStatus.slice(1) : 'Unknown'}
                </p>
                {health.apiResponseTime && (
                  <p className="text-sm text-gray-600 mt-1">
                    Response time: {health.apiResponseTime}ms
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Database</h2>
              <div className={`p-4 rounded-lg ${getStatusBg(health.databaseStatus || 'unknown')}`}>
                <p className={`font-semibold ${getStatusColor(health.databaseStatus || 'unknown')}`}>
                  {health.databaseStatus ? health.databaseStatus.charAt(0).toUpperCase() + health.databaseStatus.slice(1) : 'Unknown'}
                </p>
                {health.queryTime && (
                  <p className="text-sm text-gray-600 mt-1">
                    Query time: {health.queryTime}ms
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Candidates</p>
                <p className="text-3xl font-bold text-purple-600">{health.totalCandidates || 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600">{health.totalEmployees || 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Devices</p>
                <p className="text-3xl font-bold text-green-600">{health.totalDevices || 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Custom Fields</p>
                <p className="text-3xl font-bold text-orange-600">{health.totalCustomFields || 0}</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">API Response Time</span>
                  <span className="text-sm text-gray-600">{health.apiResponseTime || '0'}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((health.apiResponseTime || 0) / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Database Query Time</span>
                  <span className="text-sm text-gray-600">{health.queryTime || '0'}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((health.queryTime || 0) / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Uptime</span>
                  <span className="text-sm text-gray-600">{health.uptime || '0%'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${parseFloat(health.uptime || '0')}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h2>
            {health.recentActivities && health.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {health.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <div className="text-2xl">{activity.icon || '📋'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
          </div>

          {/* System Version */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">System Information</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Version:</span> {health.version || '1.0.0'}
              </p>
              <p>
                <span className="font-medium">Build:</span> {health.build || 'Latest'}
              </p>
              <p>
                <span className="font-medium">Environment:</span> {health.environment || 'Production'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
