import { useState, useCallback } from 'react';

/**
 * Custom hook for managing admin operations
 * Provides methods for custom fields, templates, settings, and feature requests
 */
export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper function to make API calls
   */
  const apiCall = useCallback(async (method, endpoint, body = null) => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const url = `/api/admin${endpoint}`;
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Custom Fields API
  const getCustomFields = useCallback(async () => {
    return apiCall('GET', '/custom-fields');
  }, [apiCall]);

  const createCustomField = useCallback(async (data) => {
    return apiCall('POST', '/custom-fields', data);
  }, [apiCall]);

  const updateCustomField = useCallback(async (id, data) => {
    return apiCall('PATCH', `/custom-fields/${id}`, data);
  }, [apiCall]);

  const deleteCustomField = useCallback(async (id) => {
    return apiCall('DELETE', `/custom-fields/${id}`);
  }, [apiCall]);

  // Onboarding Templates API
  const getOnboardingTemplates = useCallback(async () => {
    return apiCall('GET', '/templates');
  }, [apiCall]);

  const createTemplate = useCallback(async (data) => {
    return apiCall('POST', '/templates', data);
  }, [apiCall]);

  const updateTemplate = useCallback(async (id, data) => {
    return apiCall('PATCH', `/templates/${id}`, data);
  }, [apiCall]);

  const deleteTemplate = useCallback(async (id) => {
    return apiCall('DELETE', `/templates/${id}`);
  }, [apiCall]);

  // Settings API
  const getSettings = useCallback(async () => {
    return apiCall('GET', '/settings');
  }, [apiCall]);

  const updateSettings = useCallback(async (data) => {
    return apiCall('PUT', '/settings', data);
  }, [apiCall]);

  // Feature Requests API
  const getFeatureRequests = useCallback(async (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    const query = params.toString();
    return apiCall('GET', `/feature-requests${query ? '?' + query : ''}`);
  }, [apiCall]);

  const createFeatureRequest = useCallback(async (data) => {
    return apiCall('POST', '/feature-requests', data);
  }, [apiCall]);

  const updateFeatureRequest = useCallback(async (id, data) => {
    return apiCall('PATCH', `/feature-requests/${id}`, data);
  }, [apiCall]);

  // System Health API
  const getSystemHealth = useCallback(async () => {
    return apiCall('GET', '/health');
  }, [apiCall]);

  return {
    loading,
    error,
    // Custom Fields
    getCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    // Templates
    getOnboardingTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Settings
    getSettings,
    updateSettings,
    // Feature Requests
    getFeatureRequests,
    createFeatureRequest,
    updateFeatureRequest,
    // Health
    getSystemHealth,
  };
}

export default useAdmin;
