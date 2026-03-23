/**
 * useCandidates Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCandidates } from '../../hooks/useCandidates';

// Mock fetch
global.fetch = jest.fn();

describe('useCandidates Hook', () => {
  const mockCandidates = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Frontend Engineer',
      stage: 'sourced',
      status: 'active',
      notes: '',
      resumeUrl: null,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'Backend Engineer',
      stage: 'interview',
      status: 'active',
      notes: 'Strong technical background',
      resumeUrl: null,
      createdAt: '2024-01-05',
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'UI Designer',
      stage: 'offer',
      status: 'active',
      notes: '',
      resumeUrl: 'https://example.com/resume.pdf',
      createdAt: '2024-01-10',
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchCandidates', () => {
    test('fetches candidates successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: mockCandidates }),
      });

      const { result } = renderHook(() => useCandidates());

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await result.current.fetchCandidates();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.candidates).toEqual(mockCandidates);
      expect(result.current.error).toBeNull();
      expect(fetch).toHaveBeenCalledWith('/api/candidates?');
    });

    test('fetches candidates with filters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [mockCandidates[1]] }),
      });

      const { result } = renderHook(() => useCandidates());

      await act(async () => {
        await result.current.fetchCandidates({ stage: 'interview' });
      });

      expect(fetch).toHaveBeenCalledWith('/api/candidates?stage=interview');
    });

    test('handles fetch error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useCandidates());

      await act(async () => {
        try {
          await result.current.fetchCandidates();
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.candidates).toEqual([]);
    });
  });

  describe('createCandidate', () => {
    test('creates a new candidate', async () => {
      const newCandidate = {
        name: 'David Lee',
        email: 'david@example.com',
        role: 'Product Manager',
        stage: 'sourced',
        status: 'active',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '4', ...newCandidate } }),
      });

      const { result } = renderHook(() => useCandidates());

      await act(async () => {
        await result.current.createCandidate(newCandidate);
      });

      expect(result.current.candidates).toHaveLength(1);
      expect(result.current.candidates[0]).toEqual(
        expect.objectContaining(newCandidate)
      );
    });

    test('handles create error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid email' }),
      });

      const { result } = renderHook(() => useCandidates());

      await act(async () => {
        try {
          await result.current.createCandidate({
            name: 'Invalid',
            email: 'invalid',
          });
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('updateCandidate', () => {
    test('updates a candidate', async () => {
      const { result } = renderHook(() => useCandidates());

      // Set initial state
      await act(async () => {
        result.current.setCandidates(mockCandidates);
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '1', stage: 'screening' } }),
      });

      await act(async () => {
        await result.current.updateCandidate('1', { stage: 'screening' });
      });

      expect(result.current.candidates[0].stage).toBe('screening');
    });

    test('handles update error', async () => {
      const { result } = renderHook(() => useCandidates());

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await act(async () => {
        try {
          await result.current.updateCandidate('999', { stage: 'screening' });
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('deleteCandidate', () => {
    test('deletes a candidate', async () => {
      const { result } = renderHook(() => useCandidates());

      await act(async () => {
        result.current.setCandidates(mockCandidates);
      });

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.deleteCandidate('1');
      });

      expect(result.current.candidates).toHaveLength(2);
      expect(result.current.candidates.find(c => c.id === '1')).toBeUndefined();
    });

    test('handles delete error', async () => {
      const { result } = renderHook(() => useCandidates());

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await act(async () => {
        try {
          await result.current.deleteCandidate('999');
        } catch (e) {
          // Error expected
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('getCandidatesByStage', () => {
    test('groups candidates by stage', () => {
      const { result } = renderHook(() => useCandidates());

      act(() => {
        result.current.setCandidates(mockCandidates);
      });

      const grouped = result.current.getCandidatesByStage();

      expect(grouped.sourced).toHaveLength(1);
      expect(grouped.interview).toHaveLength(1);
      expect(grouped.offer).toHaveLength(1);
      expect(grouped.screening).toHaveLength(0);
      expect(grouped.hired).toHaveLength(0);
    });
  });

  describe('getCountByStage', () => {
    test('returns count of candidates per stage', () => {
      const { result } = renderHook(() => useCandidates());

      act(() => {
        result.current.setCandidates(mockCandidates);
      });

      const counts = result.current.getCountByStage();

      expect(counts.sourced).toBe(1);
      expect(counts.interview).toBe(1);
      expect(counts.offer).toBe(1);
      expect(counts.screening).toBe(0);
      expect(counts.hired).toBe(0);
    });
  });

  describe('filterCandidates', () => {
    test('filters candidates by predicate', () => {
      const { result } = renderHook(() => useCandidates());

      act(() => {
        result.current.setCandidates(mockCandidates);
      });

      const filtered = result.current.filterCandidates(c => c.stage === 'interview');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Bob Smith');
    });
  });
});
