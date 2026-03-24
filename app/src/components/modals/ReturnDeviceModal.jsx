import { useState } from 'react';

/**
 * ReturnDeviceModal Component
 * Modal to return a device from an employee
 */
export default function ReturnDeviceModal({ device, onSuccess, onCancel }) {
  const [returnedDate, setReturnedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3001/api/devices/${device.id}/return`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            returnedDate,
            condition: condition || null,
            notes: notes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to return device');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
      console.error('Error returning device:', err);
    } finally {
      setSubmitting(false);
    }
  }

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
              Return Device
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

            {/* Return Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Return Date
              </label>
              <input
                type="date"
                value={returnedDate}
                onChange={e => setReturnedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Device Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map(cond => (
                  <button
                    key={cond.value}
                    type="button"
                    onClick={() => setCondition(cond.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      condition === cond.value
                        ? cond.value === 'new'
                          ? 'bg-green-600 text-white'
                          : cond.value === 'good'
                          ? 'bg-blue-600 text-white'
                          : cond.value === 'fair'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes about the device condition or return..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              disabled={submitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Returning...' : 'Return Device'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
