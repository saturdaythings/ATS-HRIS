/**
 * Tracks Page
 * Main page for managing onboarding and offboarding tracks
 */
import { useState, useEffect } from 'react';
import { useTracks } from '../hooks/useTracks';
import TrackList from '../components/TrackList';
import TrackDetail from '../components/TrackDetail';
import TimelinePreview from '../components/TimelinePreview';

export default function Tracks() {
  const {
    tracks,
    loading,
    error,
    createTrack,
    updateTrack,
    deleteTrack,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTracks();

  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateTrack = () => {
    setShowCreateModal(true);
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
  };

  const handleCloseDetail = () => {
    setSelectedTrack(null);
  };

  const handleUpdateTrack = async (trackData) => {
    if (selectedTrack) {
      await updateTrack(selectedTrack.id, trackData);
      setSelectedTrack(null);
    }
  };

  const handleAddTask = async (taskData) => {
    if (selectedTrack) {
      await addTask(selectedTrack.id, taskData);
      // Refresh selected track to show new task
      const updatedTrack = tracks.find(t => t.id === selectedTrack.id);
      setSelectedTrack(updatedTrack);
    }
  };

  const handleEditTask = async (taskId, taskData) => {
    if (selectedTrack) {
      await updateTask(selectedTrack.id, taskId, taskData);
      const updatedTrack = tracks.find(t => t.id === selectedTrack.id);
      setSelectedTrack(updatedTrack);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (selectedTrack) {
      await deleteTask(selectedTrack.id, taskId);
      const updatedTrack = tracks.find(t => t.id === selectedTrack.id);
      setSelectedTrack(updatedTrack);
    }
  };

  const handleReorderTasks = async (taskId, newOrder) => {
    if (selectedTrack) {
      await reorderTasks(selectedTrack.id, taskId, newOrder);
      const updatedTrack = tracks.find(t => t.id === selectedTrack.id);
      setSelectedTrack(updatedTrack);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tracks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tracks</h1>
              <p className="text-slate-600 mt-1">Manage onboarding and offboarding tracks</p>
            </div>
            <button
              onClick={handleCreateTrack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Create Track
            </button>
          </div>

          {/* Track list */}
          {tracks.length === 0 ? (
            <div className="p-8 bg-white rounded-lg border border-slate-200 text-center">
              <p className="text-slate-600">No tracks created yet</p>
              <button
                onClick={handleCreateTrack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create your first track
              </button>
            </div>
          ) : (
            <TrackList
              tracks={tracks}
              onCreateTrack={handleCreateTrack}
              onSelectTrack={handleSelectTrack}
              onUpdateTrack={handleUpdateTrack}
              onDeleteTrack={deleteTrack}
              showCreateModal={showCreateModal}
              onCloseModal={() => setShowCreateModal(false)}
              onSubmitCreate={createTrack}
            />
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedTrack && (
        <div className="w-1/2 bg-white border-l border-slate-200 overflow-auto flex flex-col">
          <TrackDetail
            track={selectedTrack}
            onClose={handleCloseDetail}
            onUpdate={handleUpdateTrack}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={handleReorderTasks}
          />

          {/* Timeline preview */}
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <TimelinePreview track={selectedTrack} />
          </div>
        </div>
      )}
    </div>
  );
}
