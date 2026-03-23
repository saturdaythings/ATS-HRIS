import { useState, useEffect } from 'react';

/**
 * FieldBuilder Component
 * Reusable form for creating and editing custom fields
 */
export default function FieldBuilder({ field = null, onSave, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    entityType: 'candidate',
    options: '[]',
    required: false,
    order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form with existing field (edit mode)
  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name,
        label: field.label,
        type: field.type,
        entityType: field.entityType,
        options: field.options || '[]',
        required: field.required,
        order: field.order,
      });
    }
  }, [field]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Field name must be lowercase letters, numbers, and underscores';
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.entityType) {
      newErrors.entityType = 'Entity type is required';
    }

    if (formData.type === 'select') {
      try {
        const parsed = JSON.parse(formData.options);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          newErrors.options = 'Options must be a non-empty JSON array';
        }
      } catch {
        newErrors.options = 'Options must be valid JSON';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      required: formData.required,
      order: parseInt(formData.order),
    };

    onSave(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isEditMode = !!field;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Field Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Field Name (snake_case)
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isEditMode}
          placeholder="e.g., tshirt_size"
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } ${isEditMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        {isEditMode && <p className="mt-1 text-xs text-gray-500">Cannot change in edit mode</p>}
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Display Label</label>
        <input
          type="text"
          name="label"
          value={formData.label}
          onChange={handleChange}
          placeholder="e.g., T-Shirt Size"
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            errors.label ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label}</p>}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={isEditMode}
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          } ${isEditMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
        >
          <option value="text">Text</option>
          <option value="select">Select/Dropdown</option>
          <option value="date">Date</option>
          <option value="checkbox">Checkbox</option>
          <option value="number">Number</option>
        </select>
        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
        {isEditMode && <p className="mt-1 text-xs text-gray-500">Cannot change in edit mode</p>}
      </div>

      {/* Entity Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
        <div className="space-y-2">
          {['candidate', 'employee', 'device'].map((entity) => (
            <label key={entity} className="flex items-center">
              <input
                type="radio"
                name="entityType"
                value={entity}
                checked={formData.entityType === entity}
                onChange={handleChange}
                disabled={isEditMode}
                className={isEditMode ? 'cursor-not-allowed opacity-50' : ''}
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{entity}</span>
            </label>
          ))}
        </div>
        {errors.entityType && <p className="mt-1 text-xs text-red-600">{errors.entityType}</p>}
        {isEditMode && <p className="mt-1 text-xs text-gray-500">Cannot change in edit mode</p>}
      </div>

      {/* Options (for select type) */}
      {formData.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options (JSON Array)
          </label>
          <textarea
            name="options"
            value={formData.options}
            onChange={handleChange}
            placeholder='["Option 1", "Option 2", "Option 3"]'
            className={`w-full px-3 py-2 border rounded-lg text-sm font-mono ${
              errors.options ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="4"
          />
          {errors.options && <p className="mt-1 text-xs text-red-600">{errors.options}</p>}
        </div>
      )}

      {/* Required Checkbox */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="required"
            checked={formData.required}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Required field</span>
        </label>
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
        <input
          type="number"
          name="order"
          value={formData.order}
          onChange={handleChange}
          min="0"
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            errors.order ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <p className="mt-1 text-xs text-gray-500">Higher numbers appear later</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Field' : 'Create Field'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
