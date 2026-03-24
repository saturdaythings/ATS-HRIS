/**
 * TrackDetail Component
 * Shows expanded view of a track with task list and management
 */
import { useState } from 'react';
import TaskModal from './modals/TaskModal';
import ConfirmDialog from './modals/ConfirmDialog';

const ownerRoleColors = {
  'onboarding-manager': 'bg-blue-100 text-blue-700',
  'manager': 'bg-purple-100 text-purple-700',
  'hr': 'bg-emerald-100 text-emerald-700',
  'team-lead': 'bg-orange-100 text-orange-700',
};

const typeLabels = {
  role: 'Role',
  company: 'Company',
  client: 'Client',
};

export default function TrackDetail({
  track,
  onClose,
  onUpdate,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
}) {
  const [showTaskModal, setShowTaskModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sortedTasks = [...(track.tasks || [])].sort((a, b) => a.order - b.order);

  const handleAddTask = async (taskData) => {
    await onAddTask(taskData);
    setShowTaskModal(null);
  };

  const handleEditTask = async (taskData) => {
    if (showTaskModal && showTaskModal.id) {
      await onEditTask(showTaskModal.id, taskData);
    }
    setShowTaskModal(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      await onDeleteTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleMoveTask = async (taskId, direction) => {
    const taskIndex = sortedTasks.findIndex(t => t.id === taskId);
    if (direction === 'up' && taskIndex > 0) {
      const newOrder = sortedTasks[taskIndex - 1].order;
      await onReorderTasks(taskId, newOrder);
    } else if (direction === 'down' && taskIndex < sortedTasks.length - 1) {
      const newOrder = sortedTasks[taskIndex + 1].order;
      await onReorderTasks(taskId, newOrder);
    }
  };

  return (
    <>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{track.name}</h2>
            <p className="text-slate-600 mt-1">{track.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                {typeLabels[track.type]}
              </span>
              {track.autoApply && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Auto-apply
                </span>
              )}
            </div>
          </div>
          <button
            data-testid="close-detail"
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tasks section */}
        <div className="flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tasks</h3>

          {sortedTasks.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
              <p className="text-slate-600 text-sm">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{task.name}</h4>
                      {task.description && (
                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ownerRoleColors[task.ownerRole] ||
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.ownerRole}
                        </span>
                        <span className="text-xs text-slate-600">
                          Day {task.dueDaysOffset >= 0 ? '+' : ''}
                          {task.dueDaysOffset}
                        </span>
                      </div>
                    </div>

                    {/* Task actions */}
                    <div className="flex gap-2">
                      <button
                        data-testid={`move-up-${task.id}`}
                        disabled={index === 0}
                        onClick={() => handleMoveTask(task.id, 'up')}
                        className="p-1 hover:bg-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z" />
                        </svg>
                      </button>

                      <button
                        data-testid={`move-down-${task.id}`}
                        disabled={index === sortedTasks.length - 1}
                        onClick={() => handleMoveTask(task.id, 'down')}
                        className="p-1 hover:bg-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 10l-5 5-5-5z" />
                        </svg>
                      </button>

                      <button
                        data-testid={`edit-task-${task.id}`}
                        onClick={() => setShowTaskModal(task)}
                        className="p-1 hover:bg-slate-300 rounded transition-colors text-slate-600"
                        title="Edit task"
                      >
                        <svg
                          className="w-4 h-4"
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
                        data-testid={`delete-task-${task.id}`}
                        onClick={() => setDeleteConfirm(task.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                        title="Delete task"
                      >
                        <svg
                          className="w-4 h-4"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add task button */}
        <button
          onClick={() => setShowTaskModal({ mode: 'create' })}
          className="mt-4 w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={!!showTaskModal}
          mode={showTaskModal.id ? 'edit' : 'create'}
          task={showTaskModal.id ? showTaskModal : undefined}
          onClose={() => setShowTaskModal(null)}
          onSubmit={showTaskModal.id ? handleEditTask : handleAddTask}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          message="Delete this task? This action cannot be undone."
          confirmLabel="Delete Task"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
