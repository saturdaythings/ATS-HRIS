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
    <div ref={dropdownRef} className="relative inline-block">
      {/* Columns button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm text-slate-700 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
      >
        Columns ▾
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-56">
          <div className="max-h-64 overflow-y-auto p-2">
            {allColumns.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">No columns available</div>
            ) : (
              allColumns.map(column => {
                const isVisible = visibleColumns.includes(column);
                const isDisabled = isColumnDisabled(column);

                return (
                  <label
                    key={column}
                    className={`block px-4 py-2 rounded hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => handleToggleColumn(column)}
                      disabled={isDisabled}
                      className={`mr-3 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    />
                    <span className={isDisabled ? 'text-slate-400' : 'text-slate-900'}>
                      {column}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Info footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
            {visibleColumns.length}/{allColumns.length} visible
            {visibleColumns.length === 2 && (
              <div className="text-slate-500 mt-1">Minimum 2 columns required</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
