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

  const isActive = selected.length > 0;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Main filter button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`filter-chip${isActive ? ' on' : ''}`}
        style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        {label}
        {isActive && <span> ({selected.length})</span>}
        <span> ▾</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="col-dropdown open" style={{ top: '100%', marginTop: '4px', left: 0, right: 'auto' }}>
          <div className="col-dropdown-title">{label}</div>
          {options.length === 0 ? (
            <div className="col-row" style={{ color: '#aaa' }}>No options available</div>
          ) : (
            options.map(option => {
              const isChecked = selected.includes(option);
              return (
                <div
                  key={option}
                  className="col-row"
                  onClick={() => handleToggleOption(option)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`col-checkbox${isChecked ? ' checked' : ''}`}>
                    {isChecked ? '✓' : ''}
                  </div>
                  {option}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active filter chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {selected.map(item => (
            <span
              key={item}
              className="filter-chip on"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {item}
              <span
                onClick={(e) => handleRemoveChip(item, e)}
                style={{ cursor: 'pointer', marginLeft: '2px' }}
              >
                ✕
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
