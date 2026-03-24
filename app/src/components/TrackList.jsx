/**
 * TrackList Component
 * Displays list of all tracks with type badges
 */
import { useState } from 'react';
import TrackModal from './modals/TrackModal';
import ConfirmDialog from './modals/ConfirmDialog';

const typeColors = {
  role: 'bg-blue-100 text-blue-700',
  company: 'bg-purple-100 text-purple-700',
  client: 'bg-emerald-100 text-emerald-700',
};

const typeLabels = {
  role: 'Role',
  company: 'Company',
  client: 'Client',
};

export default function TrackList({
  tracks,
  onCreateTrack,
  onSelectTrack,
  onUpdateTrack,
  onDeleteTrack,
  showCreateModal,
  onCloseModal,
  onSubmitCreate,
}) {
  const [expandedTrackId, setExpandedTrackId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toggleExpand = (trackId) => {
    setExpandedTrackId(expandedTrackId === trackId ? null : trackId);
  };

  const handleCreateSubmit = async (trackData) => {
    await onSubmitCreate(trackData);
    onCloseModal();
  };

  const handleEditSubmit = async (trackData) => {
    await onUpdateTrack(trackData);
    setShowEditModal(null);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteTrack(deleteConfirm);
    setDeleteConfirm(null);
  };

  if (tracks.length === 0) {
    return <div className="text-center text-slate-600">No tracks</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {/* Track header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
              onClick={() => onSelectTrack(track)}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  data-testid={`expand-track-${track.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(track.id);
                  }}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedTrackId === track.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{track.name}</h3>
                  <p className="text-sm text-slate-600">{track.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        typeColors[track.type]
                      }`}
                    >
                      {typeLabels[track.type]}
                    </span>
                    <span className="text-xs text-slate-600">
                      {track.tasks?.length || 0} tasks
                    </span>
                    {track.autoApply && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Auto-apply
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  data-testid={`edit-track-${track.id}`}
                  onClick={() => setShowEditModal(track)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                  title="Edit track"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  data-testid={`delete-track-${track.id}`}
                  onClick={() => setDeleteConfirm(track.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-slate-600 hover:text-red-600"
                  title="Delete track"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded task list */}
            {expandedTrackId === track.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
                {track.tasks && track.tasks.length > 0 ? (
                  <>
                    {track.tasks
                      .sort((a, b) => a.order - b.order)
                      .map((task, index) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white rounded border border-slate-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{task.name}</h4>
                              {task.description && (
                                <p className="text-sm text-slate-600 mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                                <span className="px-2 py-1 bg-slate-100 rounded">
                                  {task.ownerRole}
                                </span>
                                <span>
                                  Day {task.dueDaysOffset >= 0 ? '+' : ''}
                                  {task.dueDaysOffset}
                                </span>
                              </div>
                            </div>

                            {/* Task actions */}
                            <div className="flex gap-1">
                              {index > 0 && (
                                <button
                                  data-testid={`move-up-${task.id}`}
                                  onClick={() => {
                                    /* Reorder logic */
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                                  title="Move up"
                                >
                                  ↑
                                </button>
                              )}
                              {index < track.tasks.length - 1 && (
                                <button
                                  data-testid={`move-down-${task.id}`}
                                  onClick={() => {
                                    /* Reorder logic */
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                                  title="Move down"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  /* Edit task */
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => {
                                  /* Delete task */
                                }}
                                className="p-1 hover:bg-red-100 rounded text-slate-600 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </>
                ) : (
                  <p className="text-sm text-slate-600 italic">No tasks</p>
                )}

                <button
                  data-testid={`add-task-${track.id}`}
                  className="w-full py-2 border-2 border-dashed border-slate-300 rounded hover:border-slate-400 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                >
                  + Add Task
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      <TrackModal
        isOpen={showCreateModal}
        mode="create"
        onClose={onCloseModal}
        onSubmit={handleCreateSubmit}
      />

      {showEditModal && (
        <TrackModal
          isOpen={!!showEditModal}
          mode="edit"
          track={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          message="Are you sure you want to delete this track? This action cannot be undone."
          confirmLabel="Confirm Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
