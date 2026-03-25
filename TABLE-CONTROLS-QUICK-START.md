# Table Controls Quick Start Guide

**For:** Developers integrating table controls into new table components

---

## 1. Import the Hook and Components

```jsx
import { useTableState } from '../hooks/useTableState';
import FilterChip from '../components/common/FilterChip';
import ColumnVisibilityToggle from '../components/common/ColumnVisibilityToggle';
```

---

## 2. Initialize Table State

```jsx
const ALL_COLUMNS = ['name', 'email', 'department', 'status'];

export default function MyTable() {
  const tableState = useTableState(
    'myTable',           // Table ID (for logging/debugging)
    ALL_COLUMNS,         // All available columns
    'name',              // Default sort column
    'asc'                // Default sort order ('asc' or 'desc')
  );

  const [data, setData] = useState([]);
```

---

## 3. Apply Filters and Sort to Data

```jsx
// Filter and sort data before rendering
const processedData = tableState.applySort(
  tableState.applyFilters(data)
);
```

---

## 4. Add Filter Chips to UI

```jsx
<div className="flex flex-wrap gap-3 items-center">
  <span className="text-sm font-medium text-gray-600">Filters:</span>

  <FilterChip
    label="Status"
    options={['active', 'inactive', 'archived']}
    selected={tableState.filters.status || []}
    onChange={(value) => tableState.updateFilter('status', value)}
  />

  <FilterChip
    label="Department"
    options={['Engineering', 'Sales', 'HR']}
    selected={tableState.filters.department || []}
    onChange={(value) => tableState.updateFilter('department', value)}
  />

  {tableState.getActiveFilterCount() > 0 && (
    <button onClick={() => tableState.clearFilters()}>
      Clear all
    </button>
  )}

  <div className="flex-grow" />

  <ColumnVisibilityToggle
    allColumns={ALL_COLUMNS}
    visibleColumns={tableState.visibleColumns}
    onToggle={(col) => tableState.toggleColumnVisibility(col)}
  />
</div>
```

---

## 5. Make Table Headers Clickable for Sort

```jsx
<thead>
  <tr className="border-b border-gray-200 bg-gray-50">
    {tableState.visibleColumns.includes('name') && (
      <th
        onClick={() => tableState.handleSortClick('name')}
        className="cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          Name
          {tableState.sortColumn === 'name' && (
            <span className="text-sm">
              {tableState.sortOrder === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    )}
    {/* Repeat for each column */}
  </tr>
</thead>
```

---

## 6. Conditionally Render Columns Based on Visibility

```jsx
<tbody>
  {processedData.map(item => (
    <tr key={item.id}>
      {tableState.visibleColumns.includes('name') && (
        <td>{item.name}</td>
      )}
      {tableState.visibleColumns.includes('email') && (
        <td>{item.email}</td>
      )}
      {tableState.visibleColumns.includes('department') && (
        <td>{item.department}</td>
      )}
      {tableState.visibleColumns.includes('status') && (
        <td>{item.status}</td>
      )}
    </tr>
  ))}
</tbody>
```

---

## Complete Example

```jsx
import { useState, useEffect } from 'react';
import { useTableState } from '../hooks/useTableState';
import FilterChip from '../components/common/FilterChip';
import ColumnVisibilityToggle from '../components/common/ColumnVisibilityToggle';

const ALL_COLUMNS = ['name', 'email', 'department', 'status'];

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const tableState = useTableState('employees', ALL_COLUMNS, 'name', 'asc');

  useEffect(() => {
    // Fetch employees
    fetchEmployees().then(setEmployees);
  }, []);

  // Process data through filters and sort
  const processedEmployees = tableState.applySort(
    tableState.applyFilters(employees)
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <FilterChip
          label="Status"
          options={['active', 'inactive']}
          selected={tableState.filters.status || []}
          onChange={(v) => tableState.updateFilter('status', v)}
        />

        {tableState.getActiveFilterCount() > 0 && (
          <button onClick={() => tableState.clearFilters()}>
            Clear filters
          </button>
        )}

        <ColumnVisibilityToggle
          allColumns={ALL_COLUMNS}
          visibleColumns={tableState.visibleColumns}
          onToggle={(col) => tableState.toggleColumnVisibility(col)}
        />
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            {tableState.visibleColumns.includes('name') && (
              <th
                onClick={() => tableState.handleSortClick('name')}
                className="cursor-pointer hover:bg-gray-100"
              >
                Name {tableState.sortColumn === 'name' && (
                  tableState.sortOrder === 'asc' ? '↑' : '↓'
                )}
              </th>
            )}
            {tableState.visibleColumns.includes('email') && (
              <th
                onClick={() => tableState.handleSortClick('email')}
                className="cursor-pointer hover:bg-gray-100"
              >
                Email {tableState.sortColumn === 'email' && (
                  tableState.sortOrder === 'asc' ? '↑' : '↓'
                )}
              </th>
            )}
            {tableState.visibleColumns.includes('department') && (
              <th
                onClick={() => tableState.handleSortClick('department')}
                className="cursor-pointer hover:bg-gray-100"
              >
                Department {tableState.sortColumn === 'department' && (
                  tableState.sortOrder === 'asc' ? '↑' : '↓'
                )}
              </th>
            )}
            {tableState.visibleColumns.includes('status') && (
              <th
                onClick={() => tableState.handleSortClick('status')}
                className="cursor-pointer hover:bg-gray-100"
              >
                Status {tableState.sortColumn === 'status' && (
                  tableState.sortOrder === 'asc' ? '↑' : '↓'
                )}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {processedEmployees.map(emp => (
            <tr key={emp.id} className="border-b hover:bg-gray-50">
              {tableState.visibleColumns.includes('name') && (
                <td>{emp.name}</td>
              )}
              {tableState.visibleColumns.includes('email') && (
                <td>{emp.email}</td>
              )}
              {tableState.visibleColumns.includes('department') && (
                <td>{emp.department}</td>
              )}
              {tableState.visibleColumns.includes('status') && (
                <td>{emp.status}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## API Reference

### useTableState Hook

```jsx
const tableState = useTableState(
  tableName: string,           // e.g., 'employees'
  initialColumns: string[],    // e.g., ['name', 'email', 'status']
  defaultSortColumn: string,   // Default column to sort by
  defaultSortOrder: 'asc'|'desc' // Default sort direction
);

// Returns:
{
  // Columns
  visibleColumns: string[],
  setVisibleColumns: (cols: string[]) => void,
  toggleColumnVisibility: (col: string) => void,

  // Sorting
  sortColumn: string,
  sortOrder: 'asc'|'desc',
  handleSortClick: (col: string) => void,
  setSortColumn: (col: string) => void,
  setSortOrder: (order: 'asc'|'desc') => void,

  // Filtering
  filters: object,                              // { status: ['active'], dept: ['eng'] }
  updateFilter: (key: string, value: any) => void,
  clearFilters: () => void,
  clearFilter: (key: string) => void,
  getActiveFilterCount: () => number,

  // Data processing
  applySort: (data: array) => array,
  applyFilters: (data: array) => array,
}
```

### FilterChip Component

```jsx
<FilterChip
  label="Status"                    // Button text
  options={['active', 'inactive']}  // Dropdown options
  selected={['active']}             // Currently selected values
  onChange={(v) => {...}}           // Callback when selection changes
  disabled={false}                  // Optional: disable the chip
/>
```

### ColumnVisibilityToggle Component

```jsx
<ColumnVisibilityToggle
  allColumns={['name', 'email', 'status']}    // All available columns
  visibleColumns={['name', 'status']}         // Currently visible columns
  onToggle={(col) => {...}}                   // Callback when visibility changes
/>
```

---

## Tips & Best Practices

1. **Always call `applyFilters()` before `applySort()`**
   - Filter first, then sort the filtered subset

2. **Use conditional rendering for columns**
   ```jsx
   {tableState.visibleColumns.includes('email') && (
     <td>{item.email}</td>
   )}
   ```

3. **Make filter options configurable**
   ```jsx
   const FILTER_OPTIONS = {
     status: ['active', 'inactive', 'archived'],
     dept: ['Eng', 'Sales', 'HR'],
   };
   ```

4. **Provide visual feedback for active sorts**
   ```jsx
   {tableState.sortColumn === 'name' && (
     <span>{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
   )}
   ```

5. **Use "Clear all" button only when filters are active**
   ```jsx
   {tableState.getActiveFilterCount() > 0 && (
     <button onClick={() => tableState.clearFilters()}>Clear</button>
   )}
   ```

---

## Common Patterns

### Sort by Date (Newest First)
```jsx
const tableState = useTableState('myTable', cols, 'createdAt', 'desc');
```

### Multiple Filter Chips
```jsx
['status', 'department', 'type'].map(filterKey => (
  <FilterChip
    key={filterKey}
    label={filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
    options={OPTIONS[filterKey]}
    selected={tableState.filters[filterKey] || []}
    onChange={(v) => tableState.updateFilter(filterKey, v)}
  />
))
```

### Search + Filters
```jsx
let filtered = tableState.applyFilters(data);

// Add search on top of filters
if (searchTerm) {
  filtered = filtered.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

const processed = tableState.applySort(filtered);
```

---

## Troubleshooting

**Q: Filters not working?**
A: Make sure you're calling `applyFilters()` on the data before rendering.

**Q: Sort not updating?**
A: Ensure table headers have `onClick={() => tableState.handleSortClick(column)}`.

**Q: Can't hide last column?**
A: Minimum 2 columns enforced. This is intentional.

**Q: Filters reset on page reload?**
A: By design - session-only persistence. This prevents localStorage bloat.

**Q: How to add date range filter?**
A: Set filter value as `{ start: Date, end: Date }` object. Hook handles it.

---

## Files Location

- **Hook:** `/src/hooks/useTableState.js`
- **Chips:** `/src/components/common/FilterChip.jsx`
- **Visibility:** `/src/components/common/ColumnVisibilityToggle.jsx`

## Examples in Codebase

- **Candidates:** `/src/pages/Candidates.jsx` (full integration)
- **Employees:** `/src/pages/people/Directory.jsx` (Department/Status filters)
- **Inventory:** `/src/pages/devices/Inventory.jsx` (Type/Status/Condition filters)
