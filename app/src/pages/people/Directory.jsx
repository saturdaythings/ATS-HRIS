import { useState, useEffect } from 'react';
import useEmployees from '../../hooks/useEmployees';
import EmployeeDetailPanel from '../../components/panels/EmployeeDetailPanel';
import { useTableState } from '../../hooks/useTableState';
import FilterChip from '../../components/common/FilterChip';
import ColumnVisibilityToggle from '../../components/common/ColumnVisibilityToggle';

const ALL_COLUMNS = ['name', 'email', 'title', 'department', 'status', 'startDate'];

export default function Directory() {
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    searchEmployees,
    filterByDepartment,
    filterByStatus,
    getDepartments,
    getCountByDepartment,
  } = useEmployees();

  const tableState = useTableState('employees', ALL_COLUMNS, 'name', 'asc');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedEmployees, setDisplayedEmployees] = useState([]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Update displayed employees when filters or sort changes
  useEffect(() => {
    let filtered = employees;

    // Apply search
    if (searchTerm) {
      filtered = searchEmployees(searchTerm);
    }

    // Apply filter chips
    filtered = tableState.applyFilters(filtered);

    // Apply sort
    filtered = tableState.applySort(filtered);

    setDisplayedEmployees(filtered);
  }, [employees, searchTerm, tableState, searchEmployees]);

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedEmployee(null);
  };

  const departments = getDepartments();
  const departmentCounts = getCountByDepartment();

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Directory</h1>
          <p className="text-gray-600">
            {displayedEmployees.length} of {employees.length} employees
          </p>
        </div>
      </div>

      {/* Filters & Controls Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {/* Search bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-600">Filters:</span>

          <FilterChip
            label="Department"
            options={departments}
            selected={tableState.filters.department || []}
            onChange={(value) => tableState.updateFilter('department', value)}
          />

          <FilterChip
            label="Status"
            options={['active', 'inactive', 'onboarding']}
            selected={tableState.filters.status || []}
            onChange={(value) => tableState.updateFilter('status', value)}
          />

          {tableState.getActiveFilterCount() > 0 && (
            <button
              onClick={() => tableState.clearFilters()}
              className="ml-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
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
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading && !employees.length ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">Loading employees...</p>
          </div>
        ) : displayedEmployees.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {employees.length === 0
                ? 'No employees found'
                : 'No employees match your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {tableState.visibleColumns.includes('name') && (
                    <th
                      onClick={() => tableState.handleSortClick('name')}
                      className="text-left py-3 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {tableState.sortColumn === 'name' && (
                          <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {tableState.visibleColumns.includes('email') && (
                    <th
                      onClick={() => tableState.handleSortClick('email')}
                      className="text-left py-3 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {tableState.sortColumn === 'email' && (
                          <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {tableState.visibleColumns.includes('title') && (
                    <th
                      onClick={() => tableState.handleSortClick('title')}
                      className="text-left py-3 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Title
                        {tableState.sortColumn === 'title' && (
                          <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {tableState.visibleColumns.includes('department') && (
                    <th
                      onClick={() => tableState.handleSortClick('department')}
                      className="text-left py-3 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Department
                        {tableState.sortColumn === 'department' && (
                          <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {tableState.visibleColumns.includes('status') && (
                    <th
                      onClick={() => tableState.handleSortClick('status')}
                      className="text-left py-3 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {tableState.sortColumn === 'status' && (
                          <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {tableState.visibleColumns.includes('startDate') && (
                    <th
                      onClick={() => tableState.handleSortClick('startDate')}
                      className="text-left py-3 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Start Date
                        {tableState.sortColumn === 'startDate' && (
                          <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {tableState.visibleColumns.includes('name') && (
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {employee.name || '-'}
                        </span>
                      </td>
                    )}
                    {tableState.visibleColumns.includes('email') && (
                      <td className="py-4 px-6">
                        <span className="text-gray-600 text-sm">
                          {employee.email || '-'}
                        </span>
                      </td>
                    )}
                    {tableState.visibleColumns.includes('title') && (
                      <td className="py-4 px-6">
                        <span className="text-gray-700">
                          {employee.title || '-'}
                        </span>
                      </td>
                    )}
                    {tableState.visibleColumns.includes('department') && (
                      <td className="py-4 px-6">
                        <span className="text-gray-700">
                          {employee.department || '-'}
                        </span>
                      </td>
                    )}
                    {tableState.visibleColumns.includes('status') && (
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : employee.status === 'inactive'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {employee.status
                            ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1)
                            : '-'}
                        </span>
                      </td>
                    )}
                    {tableState.visibleColumns.includes('startDate') && (
                      <td className="py-4 px-6">
                        <span className="text-gray-600 text-sm">
                          {formatDate(employee.startDate)}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
    </div>
  );
}
