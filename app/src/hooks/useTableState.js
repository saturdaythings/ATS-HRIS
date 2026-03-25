import { useState } from 'react';

/**
 * useTableState Hook
 * Manages filter, sort, and column visibility state for tables
 * All state is session-only (no persistence)
 */
export function useTableState(tableName, initialColumns, defaultSortColumn = 'name', defaultSortOrder = 'asc') {
  const [visibleColumns, setVisibleColumns] = useState(initialColumns);
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [filters, setFilters] = useState({});

  /**
   * Apply sorting to data
   */
  const applySort = (data) => {
    if (!data || data.length === 0) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const result = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortOrder === 'asc' ? result : -result;
      }

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        const result = aVal - bVal;
        return sortOrder === 'asc' ? result : -result;
      }

      // Default comparison
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  /**
   * Apply filters to data
   * Filters use AND logic (all active filters must match)
   */
  const applyFilters = (data) => {
    if (!data || data.length === 0) return data;
    if (Object.keys(filters).length === 0) return data;

    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        // Skip empty filters
        if (!value) continue;

        // Array filters (multiple selections)
        if (Array.isArray(value)) {
          if (value.length === 0) continue;
          if (!value.includes(item[key])) return false;
        }
        // Date range filters
        else if (typeof value === 'object' && value.start && value.end) {
          const itemDate = new Date(item[key]);
          if (itemDate < value.start || itemDate > value.end) return false;
        }
        // Single value filters
        else {
          if (item[key] !== value) return false;
        }
      }
      return true;
    });
  };

  /**
   * Toggle sort direction when clicking same column
   */
  const handleSortClick = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  /**
   * Toggle column visibility with minimum of 2 columns
   */
  const toggleColumnVisibility = (column) => {
    if (visibleColumns.includes(column)) {
      // Don't hide if it's the last column needed to meet minimum
      if (visibleColumns.length > 2) {
        setVisibleColumns(visibleColumns.filter(c => c !== column));
      }
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  /**
   * Update filter values
   */
  const updateFilter = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({});
  };

  /**
   * Clear specific filter
   */
  const clearFilter = (filterKey) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  /**
   * Get active filter count
   */
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object' && v !== null) return true;
      return !!v;
    }).length;
  };

  return {
    // Column visibility
    visibleColumns,
    setVisibleColumns,
    toggleColumnVisibility,

    // Sorting
    sortColumn,
    sortOrder,
    handleSortClick,
    setSortColumn,
    setSortOrder,

    // Filtering
    filters,
    updateFilter,
    clearFilters,
    clearFilter,
    getActiveFilterCount,

    // Data processing
    applySort,
    applyFilters,
  };
}
