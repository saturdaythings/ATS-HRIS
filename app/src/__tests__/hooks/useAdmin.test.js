/**
 * useAdmin Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdmin } from '../../hooks/useAdmin';

// Mock fetch
global.fetch = jest.fn();

describe('useAdmin Hook', () => {
  const mockFields = [
    {
      id: '1',
      name: 'tshirt_size',
      label: 'T-Shirt Size',
      type: 'select',
      entityType: 'employee',
      options: '["XS", "S", "M", "L", "XL"]',
      required: true,
      order: 1,
    },
  ];

  const mockTemplates = [
    {
      id: '1',
      name: 'Engineering Onboarding',
      role: 'Junior Engineer',
      items: [
        { task: 'Set up laptop', assignedTo: 'IT', dueDate: '2024-04-01' },
      ],
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Custom Fields', () => {
    test('getCustomFields fetches fields successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fields: mockFields }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.getCustomFields();
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/custom-fields', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('createCustomField posts field data', async () => {
      const newField = {
        name: 'security_level',
        label: 'Security Clearance',
        type: 'select',
        entityType: 'candidate',
        options: '["None", "Level 1", "Level 2"]',
        required: false,
        order: 2,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ field: newField }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.createCustomField(newField);
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newField),
      });
    });

    test('updateCustomField patches field', async () => {
      const fieldId = '1';
      const updates = { label: 'Updated Label', required: false };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ field: { ...mockFields[0], ...updates } }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.updateCustomField(fieldId, updates);
      });

      expect(fetch).toHaveBeenCalledWith(`/api/admin/custom-fields/${fieldId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    });

    test('deleteCustomField deletes field', async () => {
      const fieldId = '1';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.deleteCustomField(fieldId);
      });

      expect(fetch).toHaveBeenCalledWith(`/api/admin/custom-fields/${fieldId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('Templates', () => {
    test('getOnboardingTemplates fetches templates', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ templates: mockTemplates }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.getOnboardingTemplates();
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/templates', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('createTemplate posts template data', async () => {
      const newTemplate = {
        name: 'Design Onboarding',
        role: 'UI Designer',
        items: [],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ template: newTemplate }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.createTemplate(newTemplate);
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
    });
  });

  describe('Settings', () => {
    test('getSettings fetches settings', async () => {
      const mockSettings = {
        companyName: 'V.Two',
        timezone: 'EST',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: mockSettings }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.getSettings();
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('updateSettings puts settings', async () => {
      const updates = { companyName: 'V.Two Inc', timezone: 'PST' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: updates }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.updateSettings(updates);
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    });
  });

  describe('Feature Requests', () => {
    test('getFeatureRequests fetches all requests', async () => {
      const mockRequests = [
        {
          id: '1',
          title: 'Add chat feature',
          status: 'requested',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: mockRequests }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.getFeatureRequests();
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/feature-requests', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    test('getFeatureRequests fetches with status filter', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: [] }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.getFeatureRequests({ status: 'deployed' });
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/feature-requests?status=deployed', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('Health', () => {
    test('getSystemHealth fetches health data', async () => {
      const mockHealth = {
        apiStatus: 'healthy',
        databaseStatus: 'healthy',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ health: mockHealth }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.getSystemHealth();
      });

      expect(fetch).toHaveBeenCalledWith('/api/admin/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('Error Handling', () => {
    test('sets error on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        try {
          await result.current.getCustomFields();
        } catch {
          // Expected
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        try {
          await result.current.getCustomFields();
        } catch {
          // Expected
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });
});
