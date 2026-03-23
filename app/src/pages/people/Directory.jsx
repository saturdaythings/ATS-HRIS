import { useState, useEffect } from 'react';
import useEmployees from '../../hooks/useEmployees';
import EmployeeDetailPanel from '../../components/panels/EmployeeDetailPanel';

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

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [displayedEmployees, setDisplayedEmployees] = useState([]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Update displayed employees when filters change
  useEffect(() => {
    let filtered = employees;

    // Apply search
    if (searchTerm) {
      filtered = searchEmployees(searchTerm);
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(e => e.department === selectedDepartment);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(e => e.status === selectedStatus);
    }

    setDisplayedEmployees(filtered);
  }, [employees, searchTerm, selectedDepartment, selectedStatus, searchEmployees]);

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

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
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

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">All departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept} ({departmentCounts[dept] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="onboarding">Onboarding</option>
            </select>
          </div>
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
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {employee.name || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 text-sm">
                        {employee.email || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">
                        {employee.title || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">
                        {employee.department || '-'}
                      </span>
                    </td>
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
                    <td className="py-4 px-6">
                      <span className="text-gray-600 text-sm">
                        {formatDate(employee.startDate)}
                      </span>
                    </td>
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
