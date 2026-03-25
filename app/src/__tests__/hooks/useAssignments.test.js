/**
 * useAssignments Hook Tests
 */
import { renderHook, act } from '@testing-library/react';
import { useAssignments } from '../../hooks/useAssignments';

// Mock fetch
global.fetch = jest.fn();

describe('useAssignments Hook', () => {
  const mockAssignments = [
    {
      id: '1',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      deviceId: 'dev-1',
      deviceName: 'MacBook Pro',
      deviceSerial: 'SN-001',
      assignedAt: '2024-01-15T00:00:00Z',
      status: 'active',
    },
    {
      id: '2',
      employeeId: 'emp-2',
      employeeName: 'Jane Smith',
      deviceId: 'dev-2',
      deviceName: 'Dell Monitor',
      deviceSerial: 'SN-002',
      assignedAt: '2024-02-01T00:00:00Z',
      status: 'active',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAssignments', () => {
    test('fetches all assignments successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAssignments }),
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.fetchAssignments();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/assignments');
      expect(data).toEqual(mockAssignments);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('handles fetch error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.fetchAssignments();
      });

      expect(data).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch assignments: Internal Server Error');
    });

    test('returns empty array when data is null', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.fetchAssignments();
      });

      expect(data).toEqual([]);
    });
  });

  describe('fetchEmployeeAssignments', () => {
    test('fetches assignments for a specific employee', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockAssignments[0]] }),
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.fetchEmployeeAssignments('emp-1');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/assignments?employeeId=emp-1');
      expect(data).toEqual([mockAssignments[0]]);
    });

    test('handles employee fetch error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.fetchEmployeeAssignments('emp-99');
      });

      expect(data).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch assignments');
    });
  });

  describe('createAssignment', () => {
    test('creates assignment successfully', async () => {
      const newAssignment = { id: '3', employeeId: 'emp-1', deviceId: 'dev-3', status: 'active' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: newAssignment }),
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.createAssignment('emp-1', 'dev-3');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/assignments', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
      expect(data).toEqual(newAssignment);
    });

    test('throws on create error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const { result } = renderHook(() => useAssignments());

      await act(async () => {
        await expect(result.current.createAssignment('emp-1', 'dev-3')).rejects.toThrow('Failed to create assignment');
      });

      expect(result.current.error).toBe('Failed to create assignment');
    });
  });

  describe('returnAssignment', () => {
    test('returns assignment successfully', async () => {
      const returned = { ...mockAssignments[0], status: 'returned', returnedAt: '2024-03-01T00:00:00Z' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: returned }),
      });

      const { result } = renderHook(() => useAssignments());

      let data;
      await act(async () => {
        data = await result.current.returnAssignment('1');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/assignments/1', expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      }));
      expect(data).toEqual(returned);
    });

    test('throws on return error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const { result } = renderHook(() => useAssignments());

      await act(async () => {
        await expect(result.current.returnAssignment('99')).rejects.toThrow('Failed to return assignment');
      });

      expect(result.current.error).toBe('Failed to return assignment');
    });
  });

  describe('loading state', () => {
    test('sets loading during fetch', async () => {
      let resolvePromise;
      global.fetch.mockReturnValueOnce(new Promise(resolve => {
        resolvePromise = resolve;
      }));

      const { result } = renderHook(() => useAssignments());

      let fetchPromise;
      act(() => {
        fetchPromise = result.current.fetchAssignments();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise({ ok: true, json: async () => ({ data: [] }) });
        await fetchPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });
});
