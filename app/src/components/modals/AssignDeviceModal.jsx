import { useState, useEffect } from 'react';

/**
 * AssignDeviceModal Component
 * Modal to assign a device to an employee
 */
export default function AssignDeviceModal({ device, onSuccess, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/employees');
      if (!response.ok) throw new Error('Failed to load employees');
      const data = await response.json();
      setEmployees(data.filter(emp => emp.status === 'active'));
      if (data.length > 0) {
        setSelectedEmployeeId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3001/api/devices/${device.id}/assign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: selectedEmployeeId,
            assignedDate,
            notes: notes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign device');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
      console.error('Error assigning device:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Assign Device
            </h2>
            <p className="text-sm text-slate-600 mt-1">{device.serial}</p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Employee Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Employee
              </label>
              {loading ? (
                <div className="text-sm text-slate-600">Loading employees...</div>
              ) : employees.length === 0 ? (
                <div className="text-sm text-red-600">No active employees found</div>
              ) : (
                <select
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an employee...</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Employee Details */}
            {selectedEmployee && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  {selectedEmployee.name}
                </p>
                <p className="text-xs text-blue-800">{selectedEmployee.email}</p>
                {selectedEmployee.title && (
                  <p className="text-xs text-blue-800">{selectedEmployee.title}</p>
                )}
                {selectedEmployee.department && (
                  <p className="text-xs text-blue-800">
                    {selectedEmployee.department}
                  </p>
                )}
              </div>
            )}

            {/* Assigned Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Assigned Date
              </label>
              <input
                type="date"
                value={assignedDate}
                onChange={e => setAssignedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading || !selectedEmployeeId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Device'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
