/**
 * useTracks Hook
 * Manages tracks and tasks state with CRUD operations
 */
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export function useTracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tracks
  const getTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tracks`);
      if (!response.ok) throw new Error('Failed to fetch tracks');
      const data = await response.json();
      setTracks(data);
    } catch (err) {
      setError(err.message);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  // Create track
  const createTrack = async (trackData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
      });
      if (!response.ok) throw new Error('Failed to create track');
      const newTrack = await response.json();
      setTracks([...tracks, newTrack]);
      return newTrack;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update track
  const updateTrack = async (trackId, trackData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${trackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
      });
      if (!response.ok) throw new Error('Failed to update track');
      const updated = await response.json();
      setTracks(tracks.map(t => t.id === trackId ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete track
  const deleteTrack = async (trackId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${trackId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete track');
      setTracks(tracks.filter(t => t.id !== trackId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add task to track
  const addTask = async (trackId, taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${trackId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const newTask = await response.json();
      setTracks(
        tracks.map(t =>
          t.id === trackId
            ? { ...t, tasks: [...(t.tasks || []), newTask] }
            : t
        )
      );
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update task
  const updateTask = async (trackId, taskId, taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${trackId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updated = await response.json();
      setTracks(
        tracks.map(t =>
          t.id === trackId
            ? {
                ...t,
                tasks: (t.tasks || []).map(tk => tk.id === taskId ? updated : tk),
              }
            : t
        )
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (trackId, taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${trackId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTracks(
        tracks.map(t =>
          t.id === trackId
            ? { ...t, tasks: (t.tasks || []).filter(tk => tk.id !== taskId) }
            : t
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reorder tasks in track
  const reorderTasks = async (trackId, taskId, newOrder) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${trackId}/tasks/${taskId}/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });
      if (!response.ok) throw new Error('Failed to reorder tasks');
      const updated = await response.json();
      setTracks(
        tracks.map(t =>
          t.id === trackId
            ? { ...t, tasks: updated }
            : t
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    getTracks();
  }, []);

  return {
    tracks,
    loading,
    error,
    getTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
