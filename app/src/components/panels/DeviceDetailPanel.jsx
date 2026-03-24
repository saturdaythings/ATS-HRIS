import { useState, useEffect } from 'react';

/**
 * DeviceDetailPanel Component
 * Displays device details with current assignment and history
 */
export default function DeviceDetailPanel({
  device,
  onClose,
  onAssign,
  onReturn,
  onRefresh,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [device.id]);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3001/api/devices/${device.id}/history`
      );
      if (!response.ok) throw new Error('Failed to load history');
      const data = await response.json();
      setHistory(data);

      // Find current assignment
      const current = data.find(a => !a.returnedDate);
      setCurrentAssignment(current || null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    retired: 'bg-gray-100 text-gray-800',
  };

  const conditionColors = {
    new: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{device.serial}</h2>
            <p className="text-sm text-gray-600">
              {device.make} {device.model}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Device Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Device Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-900">
                  {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Make</span>
                <span className="text-sm font-medium text-gray-900">
                  {device.make}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Model</span>
                <span className="text-sm font-medium text-gray-900">
                  {device.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Serial</span>
                <span className="text-sm font-medium text-gray-900">
                  {device.serial}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[device.status]}`}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Condition</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${conditionColors[device.condition]}`}>
                  {device.condition.charAt(0).toUpperCase() +
                    device.condition.slice(1)}
                </span>
              </div>
              {device.warrantyExp && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Warranty Expires</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(device.warrantyExp)}
                  </span>
                </div>
              )}
              {device.notes && (
                <div className="pt-2">
                  <span className="text-sm text-gray-600">Notes</span>
                  <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                    {device.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Current Assignment */}
          {currentAssignment && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Current Assignment
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Employee</span>
                  <p className="text-sm font-medium text-gray-900">
                    {currentAssignment.employee?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {currentAssignment.employee?.email}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Assigned Date</span>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(currentAssignment.assignedDate)}
                  </p>
                </div>
                {currentAssignment.notes && (
                  <div>
                    <span className="text-sm text-gray-600">Notes</span>
                    <p className="text-xs text-gray-900 mt-1 bg-white p-2 rounded">
                      {currentAssignment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment History */}
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Loading history...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-600 text-sm">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No assignment history
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Assignment History
              </h3>
              <div className="space-y-3">
                {history.map((assignment, idx) => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.employee?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {assignment.employee?.email}
                        </p>
                      </div>
                      {assignment.returnedDate && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Returned
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span>Assigned: </span>
                        <span className="font-medium">
                          {formatDate(assignment.assignedDate)}
                        </span>
                      </div>
                      {assignment.returnedDate && (
                        <div>
                          <span>Returned: </span>
                          <span className="font-medium">
                            {formatDate(assignment.returnedDate)}
                          </span>
                        </div>
                      )}
                      {assignment.condition && (
                        <div>
                          <span>Condition: </span>
                          <span
                            className={`font-medium px-1 rounded text-xs ${
                              conditionColors[assignment.condition]
                            }`}
                          >
                            {assignment.condition.charAt(0).toUpperCase() +
                              assignment.condition.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          {device.status === 'available' && (
            <button
              onClick={onAssign}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Assign Device
            </button>
          )}
          {device.status === 'assigned' && (
            <button
              onClick={onReturn}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Return Device
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
