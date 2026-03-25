/**
 * DatePickerField Component
 * Provides a date input field with proper formatting
 */
import PropTypes from 'prop-types';

export default function DatePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
}) {
  const handleChange = (e) => {
    if (e.target.value) {
      onChange(new Date(e.target.value));
    } else {
      onChange(null);
    }
  };

  // Format date to YYYY-MM-DD for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors
          ${
            error
              ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 bg-white focus:border-purple-500 focus:ring-purple-500'
          }
          ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}
        `}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
}

DatePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
};
