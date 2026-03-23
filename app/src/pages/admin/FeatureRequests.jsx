import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';

const STATUSES = ['requested', 'reviewing', 'implementing', 'testing', 'deployed', 'rejected'];

export default function FeatureRequests() {
  const { getFeatureRequests, updateFeatureRequest, loading } = useAdmin();

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getFeatureRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setMessage(`Error loading requests: ${err.message}`);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateFeatureRequest(requestId, { status: newStatus });
      setMessage('Status updated successfully');
      loadRequests();
    } catch (err) {
      setMessage(`Error updating status: ${err.message}`);
    }
  };

  const handleEstimateChange = async (requestId) => {
    if (!estimatedHours) {
      setMessage('Please enter estimated hours');
      return;
    }

    try {
      await updateFeatureRequest(requestId, { estimatedHours: parseFloat(estimatedHours) });
      setMessage('Estimate updated successfully');
      setEstimatedHours('');
      loadRequests();
    } catch (err) {
      setMessage(`Error updating estimate: ${err.message}`);
    }
  };

  const groupedRequests = STATUSES.reduce((acc, status) => {
    acc[status] = requests.filter((req) => req.status === status);
    return acc;
  }, {});

  const statusColors = {
    requested: 'bg-gray-100 text-gray-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    implementing: 'bg-blue-100 text-blue-800',
    testing: 'bg-purple-100 text-purple-800',
    deployed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Requests</h1>
        <p className="text-gray-600">Track and manage feature requests through development lifecycle</p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-8">
        {STATUSES.map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900 capitalize mb-2">{status}</h2>
              <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusColors[status]}`}>
                {groupedRequests[status].length}
              </div>
            </div>

            <div className="space-y-3">
              {groupedRequests[status].map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-400 cursor-pointer transition"
                >
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{request.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                  {request.estimatedHours && (
                    <div className="mt-2 text-xs text-gray-500">
                      Est: {request.estimatedHours}h
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selectedRequest.title}</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 text-sm">{selectedRequest.description}</p>
              </div>

              {/* Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Type</h3>
                <p className="text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {selectedRequest.type}
                  </span>
                </p>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <select
                  value={selectedRequest.status}
                  onChange={(e) => {
                    handleStatusChange(selectedRequest.id, e.target.value);
                    setSelectedRequest({
                      ...selectedRequest,
                      status: e.target.value,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Hours */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Estimated Hours</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={estimatedHours || selectedRequest.estimatedHours || ''}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="Enter hours"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => handleEstimateChange(selectedRequest.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Original Message</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                  {selectedRequest.originalMessage}
                </div>
              </div>

              {/* Claude Response */}
              {selectedRequest.claudeResponse && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Claude Response</h3>
                  <div className="bg-purple-50 p-3 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                    {selectedRequest.claudeResponse}
                  </div>
                </div>
              )}

              {/* Implementation */}
              {selectedRequest.implementation && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Implementation</h3>
                  <div className="bg-green-50 p-3 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto font-mono text-xs">
                    {selectedRequest.implementation}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  {selectedRequest.completedAt && (
                    <p>Completed: {new Date(selectedRequest.completedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
