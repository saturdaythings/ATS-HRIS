/**
 * OnboardingRun Component
 * Displays detailed onboarding/offboarding run with task list and bulk actions
 * Features: Progress bar, task status management, printing, bulk completion
 */
import { useState } from 'react';
import ProgressBar from './common/ProgressBar';
import TaskStatusForm from './TaskStatusForm';

export default function OnboardingRun({
  run,
  onClose,
  onUpdateTask,
  onBulkAction,
}) {
  const [tasks, setTasks] = useState(run.tasks || []);
  const [isPrinting, setIsPrinting] = useState(false);

  // Calculate progress
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Handle task update
  const handleTaskUpdate = (taskId, newStatus) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    onUpdateTask(taskId, newStatus);
  };

  // Handle bulk mark all complete
  const handleMarkAllComplete = async () => {
    const allComplete = tasks.map((t) => ({
      ...t,
      status: 'completed',
    }));
    setTasks(allComplete);
    onBulkAction('mark-all-complete');
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  // Determine if offboarding
  const isOffboarding = run.type === 'offboarding';

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900">
            {isOffboarding ? 'Offboarding Run' : 'Onboarding Run'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {run.template?.name}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-slate-600"
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

      {/* Progress Section */}
      <div className="p-6 border-b border-slate-200">
        <ProgressBar
          completed={completedCount}
          total={totalCount}
          label={true}
          showPercentage={true}
          ariaLabel={`${run.type} progress`}
        />
      </div>

      {/* Bulk Actions */}
      <div className="px-6 py-4 border-b border-slate-200 flex gap-3">
        <button
          onClick={handleMarkAllComplete}
          className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          disabled={completedCount === totalCount}
        >
          <svg
            className="w-4 h-4 inline mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Mark All Complete
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4 inline mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2m-6 4h6"
            />
          </svg>
          Print Checklist
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No tasks in this run</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskStatusForm
                key={task.id}
                task={task}
                onSubmit={(updatedTask) => {
                  handleTaskUpdate(task.id, updatedTask.status);
                }}
                isEditable={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with Run Info */}
      {isOffboarding && (
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Final sign-off required before completion. All tasks must be marked
              complete.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
