import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for employee data fetching and mutations
 * Manages employees, onboarding, devices, and API interactions
 */
export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch employees with optional filters
   * @param {Object} filters - { department, status, searchTerm }
   */
  const fetchEmployees = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.searchTerm) params.append('search', filters.searchTerm);

      const url = `/api/employees?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(Array.isArray(data.employees) ? data.employees : Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const message = err.message || 'Failed to fetch employees';
      setError(message);
      setEmployees([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a single employee by ID
   * @param {string} id - Employee ID
   */
  const getEmployee = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetch(`/api/employees/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch employee: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      const message = err.message || 'Failed to fetch employee';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Update an existing employee
   * @param {string} id - Employee ID
   * @param {Object} updates - Fields to update
   */
  const updateEmployee = useCallback(async (id, updates) => {
    try {
      setError(null);

      const response = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update employee: ${response.status}`);
      }

      const updated = await response.json();

      // Optimistically update local state
      setEmployees(prev =>
        prev.map(e => (e.id === id ? { ...e, ...updates } : e))
      );
      return updated;
    } catch (err) {
      const message = err.message || 'Failed to update employee';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get onboarding checklist for an employee
   * @param {string} employeeId - Employee ID
   */
  const getOnboardingChecklist = useCallback(async (employeeId) => {
    try {
      setError(null);

      const response = await fetch(`/api/onboarding/checklists?employeeId=${employeeId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch onboarding checklist: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      const message = err.message || 'Failed to fetch onboarding checklist';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Mark an onboarding checklist item complete
   * @param {string} checklistId - Checklist ID
   * @param {string} itemId - Item ID
   * @param {boolean} completed - Completion status
   */
  const markChecklistItemComplete = useCallback(async (checklistId, itemId, completed) => {
    try {
      setError(null);

      const response = await fetch(`/api/onboarding/checklists/${checklistId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update checklist item: ${response.status}`);
      }

      const updated = await response.json();
      return updated;
    } catch (err) {
      const message = err.message || 'Failed to update checklist item';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get devices assigned to an employee
   * @param {string} employeeId - Employee ID
   */
  const getEmployeeDevices = useCallback(async (employeeId) => {
    try {
      setError(null);

      const response = await fetch(`/api/devices?assignedTo=${employeeId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }

      const data = await response.json();
      return data.devices || data;
    } catch (err) {
      const message = err.message || 'Failed to fetch devices';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get activity log for an employee
   * @param {string} employeeId - Employee ID
   */
  const getEmployeeActivities = useCallback(async (employeeId) => {
    try {
      setError(null);

      const response = await fetch(`/api/activities?employeeId=${employeeId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const data = await response.json();
      return data.activities || data;
    } catch (err) {
      const message = err.message || 'Failed to fetch activities';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Search employees locally
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered employees
   */
  const searchEmployees = useCallback((searchTerm) => {
    if (!searchTerm) return employees;

    const term = searchTerm.toLowerCase();
    return employees.filter(e =>
      (e.name && e.name.toLowerCase().includes(term)) ||
      (e.email && e.email.toLowerCase().includes(term))
    );
  }, [employees]);

  /**
   * Filter employees by department
   * @param {string} department - Department name
   * @returns {Array} Filtered employees
   */
  const filterByDepartment = useCallback((department) => {
    if (!department) return employees;
    return employees.filter(e => e.department === department);
  }, [employees]);

  /**
   * Filter employees by status
   * @param {string} status - Status (active, inactive, etc.)
   * @returns {Array} Filtered employees
   */
  const filterByStatus = useCallback((status) => {
    if (!status) return employees;
    return employees.filter(e => e.status === status);
  }, [employees]);

  /**
   * Get unique departments
   * @returns {Array} List of departments
   */
  const getDepartments = useCallback(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [employees]);

  /**
   * Get employee count by department
   * @returns {Object} Count by department
   */
  const getCountByDepartment = useCallback(() => {
    const counts = {};
    employees.forEach(e => {
      if (e.department) {
        counts[e.department] = (counts[e.department] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    getEmployee,
    updateEmployee,
    getOnboardingChecklist,
    markChecklistItemComplete,
    getEmployeeDevices,
    getEmployeeActivities,
    searchEmployees,
    filterByDepartment,
    filterByStatus,
    getDepartments,
    getCountByDepartment,
    setEmployees, // For manual state updates if needed
  };
}

export default useEmployees;
