/**
 * TaskForm Component
 * Form for creating and editing tasks
 */
import { useState, useEffect } from 'react';

export default function TaskForm({
  mode = 'create',
  task,
  ownerRoles = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ownerRole: '',
    dueDaysOffset: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        ownerRole: task.ownerRole || '',
        dueDaysOffset: task.dueDaysOffset || 0,
      });
    }
  }, [mode, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Handle numeric field
    if (name === 'dueDaysOffset') {
      finalValue = value === '' ? '' : parseInt(value, 10);
      if (isNaN(finalValue)) {
        return; // Don't update if not a valid number
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (!formData.ownerRole.trim()) {
      newErrors.ownerRole = 'Owner role is required';
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
        description: formData.description.trim(),
        ownerRole: formData.ownerRole,
        dueDaysOffset: parseInt(formData.dueDaysOffset, 10),
      });
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save task' });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        {mode === 'create' ? 'Create Task' : 'Edit Task'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Submit error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Name field */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Task Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Setup development environment"
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

        {/* Description field */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Task details (optional)"
            rows="3"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Owner role field */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Owner Role
          </label>
          <select
            name="ownerRole"
            value={formData.ownerRole}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
              errors.ownerRole
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          >
            <option value="">Select a role...</option>
            {ownerRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.ownerRole && (
            <p className="text-xs text-red-600 mt-1">{errors.ownerRole}</p>
          )}
        </div>

        {/* Due days offset field */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Due Days Offset
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="dueDaysOffset"
              value={formData.dueDaysOffset}
              onChange={handleChange}
              placeholder="0"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">days from start</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Use negative numbers for pre-onboarding tasks (e.g., -14 for 2 weeks before)
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
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
              ? 'Create Task'
              : 'Update Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
