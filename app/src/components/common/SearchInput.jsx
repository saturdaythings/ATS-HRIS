/**
 * SearchInput Component
 * Simple search input with debouncing
 */
import { useState, useEffect, useRef } from 'react';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Debounce the onChange callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
