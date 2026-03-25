import { useState, useEffect } from 'react';
import DeviceDetailPanel from '../../components/panels/DeviceDetailPanel';
import AssignDeviceModal from '../../components/modals/AssignDeviceModal';
import ReturnDeviceModal from '../../components/modals/ReturnDeviceModal';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import { useTableState } from '../../hooks/useTableState';
import FilterChip from '../../components/common/FilterChip';
import ColumnVisibilityToggle from '../../components/common/ColumnVisibilityToggle';

const ALL_COLUMNS = ['serial', 'type', 'make', 'condition', 'status'];
const DEVICE_TYPES = ['laptop', 'monitor', 'phone', 'peripheral'];
const STATUSES = ['available', 'assigned', 'retired'];
const CONDITIONS = ['new', 'good', 'fair', 'poor'];

export default function Inventory() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tableState = useTableState('inventory', ALL_COLUMNS, 'serial', 'asc');

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

  // Filter and sort devices using table state
  function getFilteredDevices() {
    let filtered = tableState.applyFilters(devices);
    return tableState.applySort(filtered);
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

      {/* Filters & Controls */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="table-toolbar">
          <FilterChip
            label="Type"
            options={DEVICE_TYPES}
            selected={tableState.filters.type || []}
            onChange={(value) => tableState.updateFilter('type', value)}
          />

          <FilterChip
            label="Status"
            options={STATUSES}
            selected={tableState.filters.status || []}
            onChange={(value) => tableState.updateFilter('status', value)}
          />

          <FilterChip
            label="Condition"
            options={CONDITIONS}
            selected={tableState.filters.condition || []}
            onChange={(value) => tableState.updateFilter('condition', value)}
          />

          {tableState.getActiveFilterCount() > 0 && (
            <button
              className="filter-chip"
              onClick={() => tableState.clearFilters()}
              style={{ color: '#e74c3c', borderColor: '#e74c3c' }}
            >
              Clear all
            </button>
          )}

          <ColumnVisibilityToggle
            allColumns={ALL_COLUMNS}
            visibleColumns={tableState.visibleColumns}
            onToggle={(col) => tableState.toggleColumnVisibility(col)}
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {tableState.visibleColumns.includes('serial') && (
                <th
                  onClick={() => tableState.handleSortClick('serial')}
                  className={`text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors${tableState.sortColumn === 'serial' ? ' sorted' : ''}`}
                  style={{ userSelect: 'none' }}
                >
                  Serial
                  <span className="sort-arrow">{tableState.sortColumn === 'serial' ? (tableState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
              )}
              {tableState.visibleColumns.includes('type') && (
                <th
                  onClick={() => tableState.handleSortClick('type')}
                  className={`text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors${tableState.sortColumn === 'type' ? ' sorted' : ''}`}
                  style={{ userSelect: 'none' }}
                >
                  Type
                  <span className="sort-arrow">{tableState.sortColumn === 'type' ? (tableState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
              )}
              {tableState.visibleColumns.includes('make') && (
                <th
                  onClick={() => tableState.handleSortClick('make')}
                  className={`text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors${tableState.sortColumn === 'make' ? ' sorted' : ''}`}
                  style={{ userSelect: 'none' }}
                >
                  Make / Model
                  <span className="sort-arrow">{tableState.sortColumn === 'make' ? (tableState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
              )}
              {tableState.visibleColumns.includes('condition') && (
                <th
                  onClick={() => tableState.handleSortClick('condition')}
                  className={`text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors${tableState.sortColumn === 'condition' ? ' sorted' : ''}`}
                  style={{ userSelect: 'none' }}
                >
                  Condition
                  <span className="sort-arrow">{tableState.sortColumn === 'condition' ? (tableState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
              )}
              {tableState.visibleColumns.includes('status') && (
                <th
                  onClick={() => tableState.handleSortClick('status')}
                  className={`text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors${tableState.sortColumn === 'status' ? ' sorted' : ''}`}
                  style={{ userSelect: 'none' }}
                >
                  Status
                  <span className="sort-arrow">{tableState.sortColumn === 'status' ? (tableState.sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
              )}
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
                  {tableState.visibleColumns.includes('serial') && (
                    <td
                      className="py-3 px-4 font-medium text-gray-900"
                      onClick={() => handleDeviceClick(device)}
                    >
                      {device.serial}
                    </td>
                  )}
                  {tableState.visibleColumns.includes('type') && (
                    <td
                      className="py-3 px-4 text-gray-700"
                      onClick={() => handleDeviceClick(device)}
                    >
                      {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                    </td>
                  )}
                  {tableState.visibleColumns.includes('make') && (
                    <td
                      className="py-3 px-4 text-gray-700"
                      onClick={() => handleDeviceClick(device)}
                    >
                      {device.make} {device.model}
                    </td>
                  )}
                  {tableState.visibleColumns.includes('condition') && (
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
                  )}
                  {tableState.visibleColumns.includes('status') && (
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
                  )}
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
