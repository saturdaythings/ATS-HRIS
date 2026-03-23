import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for candidate data fetching and mutations
 * Manages candidates, stages, and API interactions
 */
export function useCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch candidates with optional filters
   * @param {Object} filters - { stage, status, searchTerm }
   */
  const fetchCandidates = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.status) params.append('status', filters.status);
      if (filters.searchTerm) params.append('search', filters.searchTerm);

      const url = `/api/candidates?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch candidates: ${response.status}`);
      }

      const data = await response.json();
      setCandidates(Array.isArray(data.candidates) ? data.candidates : data);
      return data;
    } catch (err) {
      const message = err.message || 'Failed to fetch candidates';
      setError(message);
      setCandidates([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new candidate
   * @param {Object} candidateData - { name, email, role, stage, status, resumeUrl }
   */
  const createCandidate = useCallback(async (candidateData) => {
    try {
      setError(null);

      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create candidate: ${response.status}`);
      }

      const newCandidate = await response.json();

      // Optimistically add to local state
      setCandidates(prev => [...prev, newCandidate.data || newCandidate]);
      return newCandidate;
    } catch (err) {
      const message = err.message || 'Failed to create candidate';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Update an existing candidate
   * @param {string} id - Candidate ID
   * @param {Object} updates - Fields to update
   */
  const updateCandidate = useCallback(async (id, updates) => {
    try {
      setError(null);

      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update candidate: ${response.status}`);
      }

      const updated = await response.json();

      // Optimistically update local state
      setCandidates(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      );
      return updated;
    } catch (err) {
      const message = err.message || 'Failed to update candidate';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Delete a candidate
   * @param {string} id - Candidate ID
   */
  const deleteCandidate = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete candidate: ${response.status}`);
      }

      // Remove from local state
      setCandidates(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      const message = err.message || 'Failed to delete candidate';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get candidates grouped by stage
   * @returns {Object} Candidates grouped by stage
   */
  const getCandidatesByStage = useCallback(() => {
    const stages = ['sourced', 'screening', 'interview', 'offer', 'hired'];
    const grouped = {};

    stages.forEach(stage => {
      grouped[stage] = candidates.filter(c => c.stage === stage);
    });

    return grouped;
  }, [candidates]);

  /**
   * Get candidate count by stage
   * @returns {Object} Count of candidates per stage
   */
  const getCountByStage = useCallback(() => {
    const stages = ['sourced', 'screening', 'interview', 'offer', 'hired'];
    const counts = {};

    stages.forEach(stage => {
      counts[stage] = candidates.filter(c => c.stage === stage).length;
    });

    return counts;
  }, [candidates]);

  /**
   * Filter candidates locally
   * @param {Function} predicate - Filter function
   */
  const filterCandidates = useCallback((predicate) => {
    return candidates.filter(predicate);
  }, [candidates]);

  return {
    candidates,
    loading,
    error,
    fetchCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidatesByStage,
    getCountByStage,
    filterCandidates,
    setCandidates, // For manual state updates if needed
  };
}

export default useCandidates;
