/**
 * TrackModal Component
 * Modal for creating and editing tracks
 */
import { useState, useEffect } from 'react';

const trackTypes = [
  { value: 'role', label: 'Role-based' },
  { value: 'company', label: 'Company-wide' },
  { value: 'client', label: 'Client-specific' },
];

export default function TrackModal({
  isOpen,
  mode = 'create',
  track,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'role',
    description: '',
    clientId: '',
    autoApply: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && track) {
      setFormData({
        name: track.name || '',
        type: track.type || 'role',
        description: track.description || '',
        clientId: track.clientId || '',
        autoApply: track.autoApply || false,
      });
    } else {
      setFormData({
        name: '',
        type: 'role',
        description: '',
        clientId: '',
        autoApply: false,
      });
    }
  }, [mode, track, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Track name is required';
    }

    if (formData.type === 'client' && !formData.clientId.trim()) {
      newErrors.clientId = 'Client ID is required for client-specific tracks';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        clientId: formData.type === 'client' ? formData.clientId.trim() : null,
        autoApply: formData.autoApply,
      });
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save track' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'create' ? 'Create Track' : 'Edit Track'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-slate-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Submit error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Track Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Engineering Onboarding"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Type field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Track Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {trackTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Track details and notes"
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Client ID field (shown only for client type) */}
            {formData.type === 'client' && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  placeholder="e.g., acme-corp-123"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.clientId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.clientId && (
                  <p className="text-xs text-red-600 mt-1">{errors.clientId}</p>
                )}
              </div>
            )}

            {/* Auto-apply field (shown only for company type) */}
            {formData.type === 'company' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="autoApply"
                  id="autoApply"
                  checked={formData.autoApply}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label
                  htmlFor="autoApply"
                  className="text-sm font-medium text-slate-900"
                >
                  Auto-apply to all employees
                </label>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create Track'
                  : 'Update Track'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
