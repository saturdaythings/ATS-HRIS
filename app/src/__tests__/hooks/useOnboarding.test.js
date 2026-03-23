/**
 * useOnboarding Hook Tests
 * Tests for API integration and data fetching
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useOnboarding } from '../../hooks/useOnboarding';

// Mock fetch
global.fetch = jest.fn();

describe('useOnboarding Hook', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchTemplates', () => {
    test('fetches templates without role filter', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Engineering Onboarding',
          role: 'Engineering',
          items: [],
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTemplates, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const templates = await result.current.fetchTemplates();

      expect(fetch).toHaveBeenCalledWith('/api/onboarding/templates');
      expect(templates).toEqual(mockTemplates);
    });

    test('fetches templates with role filter', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Engineering Onboarding',
          role: 'Engineering',
          items: [],
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTemplates, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const templates = await result.current.fetchTemplates('Engineering');

      expect(fetch).toHaveBeenCalledWith(
        '/api/onboarding/templates?role=Engineering'
      );
      expect(templates).toEqual(mockTemplates);
    });

    test('handles fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useOnboarding());

      await expect(result.current.fetchTemplates()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getChecklistForEmployee', () => {
    test('fetches checklist for employee', async () => {
      const mockChecklist = {
        id: 'checklist-1',
        employeeId: 'emp-1',
        templateId: 'template-1',
        status: 'active',
        items: [],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockChecklist, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const checklist = await result.current.getChecklistForEmployee('emp-1');

      expect(fetch).toHaveBeenCalledWith('/api/onboarding/checklists/emp-1');
      expect(checklist).toEqual(mockChecklist);
    });

    test('handles not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Employee not found' }),
      });

      const { result } = renderHook(() => useOnboarding());

      await expect(result.current.getChecklistForEmployee('emp-1')).rejects.toThrow();
    });
  });

  describe('assignTemplate', () => {
    test('assigns template to employee', async () => {
      const mockChecklist = {
        id: 'checklist-1',
        employeeId: 'emp-1',
        templateId: 'template-1',
        status: 'active',
        items: [],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockChecklist, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const checklist = await result.current.assignTemplate('emp-1', 'template-1');

      expect(fetch).toHaveBeenCalledWith('/api/onboarding/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'emp-1',
          templateId: 'template-1',
        }),
      });
      expect(checklist).toEqual(mockChecklist);
    });

    test('handles validation error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Missing required fields' }),
      });

      const { result } = renderHook(() => useOnboarding());

      await expect(
        result.current.assignTemplate('emp-1', 'template-1')
      ).rejects.toThrow();
    });
  });

  describe('markItemComplete', () => {
    test('marks item complete', async () => {
      const mockItem = {
        id: 'item-1',
        task: 'Set up computer',
        completed: true,
        completedAt: '2026-03-23T10:00:00Z',
        completedBy: 'hr@company.com',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockItem, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const item = await result.current.markItemComplete(
        'checklist-1',
        'item-1',
        'hr@company.com'
      );

      expect(fetch).toHaveBeenCalledWith(
        '/api/onboarding/checklists/checklist-1/items/item-1',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedBy: 'hr@company.com' }),
        }
      );
      expect(item).toEqual(mockItem);
    });

    test('handles error when marking item', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Item not found' }),
      });

      const { result } = renderHook(() => useOnboarding());

      await expect(
        result.current.markItemComplete('checklist-1', 'item-1', 'hr@company.com')
      ).rejects.toThrow();
    });
  });

  describe('getProgress', () => {
    test('calculates progress correctly', async () => {
      const mockProgress = {
        total: 10,
        completed: 7,
        percentage: 70,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProgress, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const progress = await result.current.getProgress('checklist-1');

      expect(fetch).toHaveBeenCalledWith(
        '/api/onboarding/checklists/checklist-1/progress'
      );
      expect(progress).toEqual(mockProgress);
    });
  });

  describe('getChecklistDetail', () => {
    test('fetches detailed checklist', async () => {
      const mockChecklist = {
        id: 'checklist-1',
        employeeId: 'emp-1',
        templateId: 'template-1',
        status: 'active',
        employee: {
          id: 'emp-1',
          name: 'John Doe',
          role: 'Engineer',
        },
        template: {
          id: 'template-1',
          name: 'Engineering Onboarding',
          role: 'Engineering',
        },
        items: [
          {
            id: 'item-1',
            task: 'Set up computer',
            assignedTo: 'IT',
            dueDate: '2026-03-25T00:00:00Z',
            completed: false,
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockChecklist, error: null }),
      });

      const { result } = renderHook(() => useOnboarding());

      const checklist = await result.current.getChecklistDetail('checklist-1');

      expect(fetch).toHaveBeenCalledWith(
        '/api/onboarding/checklists/detail/checklist-1'
      );
      expect(checklist).toEqual(mockChecklist);
    });
  });
});
