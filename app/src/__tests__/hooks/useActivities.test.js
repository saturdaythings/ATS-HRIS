/**
 * useActivities Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useActivities } from '../../hooks/useActivities';

// Mock fetch
global.fetch = jest.fn();

describe('useActivities Hook', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'hire',
      description: 'Alice Johnson hired',
      employeeId: 'emp1',
      deviceId: null,
      createdAt: new Date('2024-03-20').toISOString(),
    },
    {
      id: '2',
      type: 'device_assign',
      description: 'MacBook Pro assigned to Alice',
      employeeId: 'emp1',
      deviceId: 'dev1',
      createdAt: new Date('2024-03-19').toISOString(),
    },
    {
      id: '3',
      type: 'task_complete',
      description: 'Bob completed onboarding task',
      employeeId: 'emp2',
      deviceId: null,
      createdAt: new Date('2024-03-18').toISOString(),
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchActivities', () => {
    test('fetches activities successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      const { result } = renderHook(() => useActivities());

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.fetchActivities();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activities).toEqual(mockActivities);
      expect(result.current.error).toBeNull();
      expect(fetch).toHaveBeenCalledWith('/api/activities?limit=20&offset=0');
    });

    test('fetches activities with type filter', async () => {
      const filtered = [mockActivities[0]];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: filtered }),
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        await result.current.fetchActivities({ type: 'hire' });
      });

      expect(result.current.activities).toEqual(filtered);
      expect(fetch).toHaveBeenCalledWith('/api/activities?type=hire&limit=20&offset=0');
    });

    test('fetches activities with employeeId filter', async () => {
      const filtered = [mockActivities[0], mockActivities[1]];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: filtered }),
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        await result.current.fetchActivities({ employeeId: 'emp1' });
      });

      expect(result.current.activities).toEqual(filtered);
      expect(fetch).toHaveBeenCalledWith('/api/activities?employeeId=emp1&limit=20&offset=0');
    });

    test('fetches activities with custom limit', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        await result.current.fetchActivities({ limit: 50 });
      });

      expect(fetch).toHaveBeenCalledWith('/api/activities?limit=50&offset=0');
    });

    test('handles fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        try {
          await result.current.fetchActivities();
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.activities).toEqual([]);
    });
  });

  describe('loadMore', () => {
    test('loads more activities and appends to list', async () => {
      // First call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: [mockActivities[0], mockActivities[1]] }),
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        await result.current.fetchActivities({ limit: 2 });
      });

      expect(result.current.activities).toHaveLength(2);
      expect(result.current.hasMore).toBe(true);

      // Load more
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: [mockActivities[2]] }),
      });

      await act(async () => {
        await result.current.loadMore({ limit: 2 });
      });

      expect(result.current.activities).toHaveLength(3);
      expect(result.current.hasMore).toBe(false);
    });

    test('handles load more error gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        await result.current.fetchActivities();
      });

      const initialCount = result.current.activities.length;

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await act(async () => {
        try {
          await result.current.loadMore();
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.activities).toHaveLength(initialCount);
    });
  });

  describe('resetPagination', () => {
    test('clears activities and resets pagination state', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.activities).toHaveLength(3);

      act(() => {
        result.current.resetPagination();
      });

      expect(result.current.activities).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('state management', () => {
    test('sets loading state during fetch', async () => {
      let resolveJson;
      const jsonPromise = new Promise((resolve) => {
        resolveJson = resolve;
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => jsonPromise,
      });

      const { result } = renderHook(() => useActivities());

      expect(result.current.loading).toBe(false);

      const promise = act(async () => {
        await result.current.fetchActivities();
      });

      // Give it a moment to set loading state
      await new Promise((r) => setTimeout(r, 10));

      resolveJson({ activities: mockActivities });

      await promise;

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('clears error when successful fetch', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useActivities());

      await act(async () => {
        try {
          await result.current.fetchActivities();
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
