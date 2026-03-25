import { useState, useRef, useEffect } from 'react';

/**
 * FilterChip Component
 * Displays filter button with dropdown to select multiple values
 * Active filters shown as filled chips with X to remove
 */
export default function FilterChip({
  label,
  options = [],
  selected = [],
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemoveChip = (option, e) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== option));
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Main filter button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : selected.length > 0
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {label}
        {selected.length > 0 && <span className="ml-2">({selected.length})</span>}
        <span className="ml-1">▾</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-56">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">No options available</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {options.map(option => (
                <label
                  key={option}
                  className="block px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="mr-3 cursor-pointer"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {/* Selected items summary */}
          {selected.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-700">
              {selected.length} selected
            </div>
          )}
        </div>
      )}

      {/* Active filter chips below button */}
      {selected.length > 0 && (
        <div className="absolute top-full mt-10 left-0 flex flex-wrap gap-2 pt-2">
          {selected.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
            >
              {item}
              <button
                onClick={(e) => handleRemoveChip(item, e)}
                className="ml-1 text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
