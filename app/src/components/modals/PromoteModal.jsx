/**
 * PromoteModal Component
 * Modal for promoting a candidate to employee
 */
import { useState } from 'react';

export default function PromoteModal({ candidate, onConfirm, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  const departments = ['Engineering', 'Design', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm({
        ...formData,
        candidateId: candidate.id,
        candidateName: candidate.name,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Promote {candidate.name} to Employee
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Engineer"
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${errors.title ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'}
                focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
              `}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${errors.department ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'}
                focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
              `}
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="text-xs text-red-600 mt-1">{errors.department}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${errors.startDate ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'}
                focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
              `}
            />
            {errors.startDate && (
              <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>
            )}
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
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
            >
              Promote to Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
