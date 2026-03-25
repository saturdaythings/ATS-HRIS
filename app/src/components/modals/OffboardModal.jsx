/**
 * OffboardModal Component
 * Modal for starting employee offboarding process
 */
import { useState } from 'react';

export default function OffboardModal({ employee, onConfirm, onCancel }) {
  const [formData, setFormData] = useState({
    lastDay: new Date().toISOString().split('T')[0],
    trackIds: [1], // Auto-check company offboarding
  });

  const [errors, setErrors] = useState({});

  // Offboarding tracks - 1 is auto-applied
  const offboardingTracks = [
    { id: 1, name: 'Company offboarding', autoApply: true },
    { id: 2, name: 'Role offboarding (suggested by title)', autoApply: false },
    { id: 3, name: 'Client offboarding', autoApply: false },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.lastDay) newErrors.lastDay = 'Last day is required';
    if (formData.trackIds.length === 0) newErrors.trackIds = 'At least one track must be selected';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm({
        lastDay: formData.lastDay,
        trackIds: formData.trackIds,
      });
    }
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, lastDay: e.target.value }));
    if (errors.lastDay) {
      setErrors(prev => ({ ...prev, lastDay: '' }));
    }
  };

  const handleTrackToggle = (trackId) => {
    setFormData(prev => {
      const newTrackIds = prev.trackIds.includes(trackId)
        ? prev.trackIds.filter(id => id !== trackId)
        : [...prev.trackIds, trackId];
      return { ...prev, trackIds: newTrackIds };
    });
    if (errors.trackIds) {
      setErrors(prev => ({ ...prev, trackIds: '' }));
    }
  };

  // Calculate total tasks (approximate: 5 tasks per track)
  const totalTasks = formData.trackIds.length * 5;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Offboard — {employee.name}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Last Day Field */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Last Day (Required)
            </label>
            <input
              type="date"
              value={formData.lastDay}
              onChange={handleDateChange}
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${errors.lastDay ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'}
                focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
              `}
            />
            {errors.lastDay && (
              <p className="text-xs text-red-600 mt-1">{errors.lastDay}</p>
            )}
          </div>

          {/* Offboarding Tracks Section */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">
              Offboarding Tracks
            </label>
            <div className={`space-y-2 p-3 rounded-lg border ${errors.trackIds ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              {offboardingTracks.map(track => (
                <label
                  key={track.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.trackIds.includes(track.id)}
                    onChange={() => handleTrackToggle(track.id)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-900">{track.name}</span>
                </label>
              ))}
            </div>
            {errors.trackIds && (
              <p className="text-xs text-red-600 mt-1">{errors.trackIds}</p>
            )}
          </div>

          {/* Task Count Summary */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">
              Total tasks to complete: <span className="text-slate-900 font-semibold">{totalTasks}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Confirm Offboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
