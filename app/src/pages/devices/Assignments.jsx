import { useState, useEffect } from 'react';
import { useAssignments } from '../../hooks/useAssignments';
import ConfirmDialog from '../../components/modals/ConfirmDialog';

export default function Assignments() {
  const { fetchAssignments, returnAssignment, loading, error } = useAssignments();
  const [assignments, setAssignments] = useState([]);
  const [showConfirmReturn, setShowConfirmReturn] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [message, setMessage] = useState('');

  // Load assignments on mount
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const data = await fetchAssignments();
        setAssignments(data);
      } catch (err) {
        setMessage(`Error loading assignments: ${err.message}`);
      }
    };

    loadAssignments();
  }, [fetchAssignments]);

  const handleReturnClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowConfirmReturn(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedAssignment) return;

    try {
      await returnAssignment(selectedAssignment.id);
      setMessage('Device returned successfully');
      // Reload assignments
      const data = await fetchAssignments();
      setAssignments(data);
    } catch (err) {
      setMessage(`Error returning device: ${err.message}`);
    } finally {
      setShowConfirmReturn(false);
      setSelectedAssignment(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Assignments</h1>
      <p className="text-gray-600">Active device assignments to employees</p>

      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {loading && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center text-gray-500">Loading assignments...</div>
        </div>
      )}

      {!loading && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Device</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Serial</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr className="border-b border-gray-100">
                  <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                    No assignments yet
                  </td>
                </tr>
              ) : (
                assignments.map(assignment => (
                  <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{assignment.employeeName || 'Unknown'}</td>
                    <td className="py-3 px-4 text-gray-700">{assignment.deviceName || 'Unknown'}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{assignment.deviceSerial || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {assignment.status === 'active' && (
                        <button
                          onClick={() => handleReturnClick(assignment)}
                          className="text-sm px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded"
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
      )}

      <ConfirmDialog
        isOpen={showConfirmReturn && !!selectedAssignment}
        title="Return Device"
        message={selectedAssignment ? `Are you sure you want to return the device assigned to ${selectedAssignment.employeeName}?` : ''}
        onConfirm={handleConfirmReturn}
        onCancel={() => {
          setShowConfirmReturn(false);
          setSelectedAssignment(null);
        }}
        confirmLabel="Return Device"
        cancelLabel="Cancel"
      />
    </div>
  );
}
