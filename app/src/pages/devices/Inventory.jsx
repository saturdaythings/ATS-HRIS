import { useState, useEffect } from 'react';
import DeviceDetailPanel from '../../components/panels/DeviceDetailPanel';
import AssignDeviceModal from '../../components/modals/AssignDeviceModal';
import ReturnDeviceModal from '../../components/modals/ReturnDeviceModal';
import ConfirmDialog from '../../components/modals/ConfirmDialog';

export default function Inventory() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and sorting
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    condition: '',
  });
  const [sortBy, setSortBy] = useState('serial'); // serial, type, status, condition

  // UI state
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Load devices
  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/devices');
      if (!response.ok) throw new Error('Failed to load devices');
      const data = await response.json();
      setDevices(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort devices
  function getFilteredDevices() {
    let filtered = devices;

    if (filters.type) {
      filtered = filtered.filter(d => d.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }
    if (filters.condition) {
      filtered = filtered.filter(d => d.condition === filters.condition);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.type.localeCompare(b.type);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'condition':
          return a.condition.localeCompare(b.condition);
        case 'serial':
        default:
          return a.serial.localeCompare(b.serial);
      }
    });

    return filtered;
  }

  function handleDeviceClick(device) {
    setSelectedDevice(device);
    setShowDetailPanel(true);
  }

  function handleAssignClick(device) {
    setSelectedDevice(device);
    setShowAssignModal(true);
  }

  function handleReturnClick(device) {
    setSelectedDevice(device);
    setShowReturnModal(true);
  }

  function handleAssignSuccess() {
    setShowAssignModal(false);
    loadDevices();
  }

  function handleReturnSuccess() {
    setShowReturnModal(false);
    loadDevices();
  }

  function handleDeviceClosed() {
    setShowDetailPanel(false);
    setSelectedDevice(null);
  }

  const filteredDevices = getFilteredDevices();
  const deviceTypes = ['laptop', 'monitor', 'phone', 'peripheral'];
  const statuses = ['available', 'assigned', 'retired'];
  const conditions = ['new', 'good', 'fair', 'poor'];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Inventory</h1>
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8 text-gray-500">Loading devices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Inventory</h1>
      <p className="text-gray-600">
        {filteredDevices.length} of {devices.length} devices
      </p>

      {/* Filters */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            {deviceTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            value={filters.condition}
            onChange={e => setFilters({ ...filters, condition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Conditions</option>
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="serial">Serial</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
            <option value="condition">Condition</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Serial</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Make / Model</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Condition</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr className="border-b border-gray-100">
                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                  {devices.length === 0
                    ? 'No devices in inventory'
                    : 'No devices match the selected filters'}
                </td>
              </tr>
            ) : (
              filteredDevices.map(device => (
                <tr
                  key={device.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td
                    className="py-3 px-4 font-medium text-gray-900"
                    onClick={() => handleDeviceClick(device)}
                  >
                    {device.serial}
                  </td>
                  <td
                    className="py-3 px-4 text-gray-700"
                    onClick={() => handleDeviceClick(device)}
                  >
                    {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                  </td>
                  <td
                    className="py-3 px-4 text-gray-700"
                    onClick={() => handleDeviceClick(device)}
                  >
                    {device.make} {device.model}
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={() => handleDeviceClick(device)}
                  >
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.condition === 'new'
                          ? 'bg-green-100 text-green-800'
                          : device.condition === 'good'
                          ? 'bg-blue-100 text-blue-800'
                          : device.condition === 'fair'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {device.condition.charAt(0).toUpperCase() +
                        device.condition.slice(1)}
                    </span>
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={() => handleDeviceClick(device)}
                  >
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : device.status === 'assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeviceClick(device)}
                      className="mr-2 text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      View
                    </button>
                    {device.status === 'available' && (
                      <button
                        onClick={() => handleAssignClick(device)}
                        className="mr-2 text-sm px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                      >
                        Assign
                      </button>
                    )}
                    {device.status === 'assigned' && (
                      <button
                        onClick={() => handleReturnClick(device)}
                        className="text-sm px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Device Detail Panel */}
      {showDetailPanel && selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          onClose={handleDeviceClosed}
          onAssign={() => handleAssignClick(selectedDevice)}
          onReturn={() => handleReturnClick(selectedDevice)}
          onRefresh={loadDevices}
        />
      )}

      {/* Assign Device Modal */}
      {showAssignModal && selectedDevice && (
        <AssignDeviceModal
          device={selectedDevice}
          onSuccess={handleAssignSuccess}
          onCancel={() => setShowAssignModal(false)}
        />
      )}

      {/* Return Device Modal */}
      {showReturnModal && selectedDevice && (
        <ReturnDeviceModal
          device={selectedDevice}
          onSuccess={handleReturnSuccess}
          onCancel={() => setShowReturnModal(false)}
        />
      )}

      {/* Error message */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={loadDevices}
            className="mt-2 text-sm px-3 py-1 bg-red-200 hover:bg-red-300 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
