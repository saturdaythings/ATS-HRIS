import { useState, useCallback } from 'react';

/**
 * Custom hook for managing device assignments
 */
export function useAssignments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all assignments
   */
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/assignments');

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.statusText}`);
      }

      const { data } = await response.json();
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch assignments for a specific employee
   */
  const fetchEmployeeAssignments = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/assignments?employeeId=${employeeId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const { data } = await response.json();
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new assignment
   */
  const createAssignment = useCallback(async (employeeId, deviceId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, deviceId, assignedAt: new Date() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Return assignment (unassign)
   */
  const returnAssignment = useCallback(async (assignmentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'returned', returnedAt: new Date() }),
      });

      if (!response.ok) {
        throw new Error('Failed to return assignment');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAssignments,
    fetchEmployeeAssignments,
    createAssignment,
    returnAssignment,
  };
}

export default useAssignments;
