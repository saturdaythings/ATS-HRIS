import { useState, useCallback } from 'react';

/**
 * Custom hook for managing activities
 * Provides methods to fetch, filter, and paginate activities
 */
export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  /**
   * Fetch activities with optional filters
   * @param {Object} filters - { type, employeeId, deviceId, limit, offset }
   */
  const fetchActivities = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      const limit = filters.limit || 20;
      const currentOffset = filters.offset !== undefined ? filters.offset : offset;
      params.append('limit', limit);
      params.append('offset', currentOffset);

      const url = `/api/activities?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const data = await response.json();
      const newActivities = data.activities || [];

      // For pagination: if offset is 0, replace; otherwise append
      if (currentOffset === 0) {
        setActivities(newActivities);
      } else {
        setActivities((prev) => [...prev, ...newActivities]);
      }

      // Check if there are more activities to load
      setHasMore(newActivities.length === limit);
      setOffset(currentOffset + limit);
    } catch (err) {
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  /**
   * Load more activities (pagination)
   * @param {Object} filters - Current filters to apply
   */
  const loadMore = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      const limit = filters.limit || 20;
      params.append('limit', limit);
      params.append('offset', offset);

      const url = `/api/activities?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load more activities: ${response.status}`);
      }

      const data = await response.json();
      const newActivities = data.activities || [];

      // Append to existing activities
      setActivities((prev) => [...prev, ...newActivities]);

      // Update for next load
      setHasMore(newActivities.length === limit);
      setOffset((prev) => prev + limit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  /**
   * Reset pagination state
   */
  const resetPagination = useCallback(() => {
    setOffset(0);
    setActivities([]);
    setHasMore(false);
  }, []);

  return {
    activities,
    loading,
    error,
    hasMore,
    fetchActivities,
    loadMore,
    resetPagination,
  };
}

export default useActivities;
