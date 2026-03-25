import { useState, useRef, useEffect } from 'react';

/**
 * ColumnVisibilityToggle Component
 * Dropdown button to show/hide table columns
 * Enforces minimum of 2 visible columns
 */
export default function ColumnVisibilityToggle({
  allColumns = [],
  visibleColumns = [],
  onToggle,
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

  const handleToggleColumn = (column) => {
    if (visibleColumns.includes(column)) {
      // Only allow hiding if we have more than minimum (2) columns visible
      if (visibleColumns.length > 2) {
        onToggle(column);
      }
    } else {
      onToggle(column);
    }
  };

  const isColumnDisabled = (column) => {
    return visibleColumns.includes(column) && visibleColumns.length === 2;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Columns button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="col-toggle-btn"
      >
        Columns <span>▾</span>
      </button>

      {/* Dropdown menu */}
      <div className={`col-dropdown${isOpen ? ' open' : ''}`}>
        <div className="col-dropdown-title">Show / hide columns</div>
        {allColumns.length === 0 ? (
          <div className="col-row" style={{ color: '#aaa' }}>No columns available</div>
        ) : (
          allColumns.map(column => {
            const isVisible = visibleColumns.includes(column);
            const disabled = isColumnDisabled(column);

            return (
              <div
                key={column}
                className="col-row"
                onClick={() => !disabled && handleToggleColumn(column)}
                style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : { cursor: 'pointer' }}
              >
                <div className={`col-checkbox${isVisible ? ' checked' : ''}`}>
                  {isVisible ? '✓' : ''}
                </div>
                {column}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
