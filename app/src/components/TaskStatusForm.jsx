/**
 * TaskStatusForm Component
 * Inline task status and owner management with color-coded due dates
 * Supports task status updates and owner reassignment
 */
import { useState, useEffect } from 'react';

export default function TaskStatusForm({
  task,
  onSubmit,
  isEditable = false,
}) {
  const [status, setStatus] = useState(task.status);
  const [owner, setOwner] = useState(task.owner);
  const [isDirty, setIsDirty] = useState(false);

  // Calculate due date color
  const getDueDateColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysFromNow = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (task.status === 'completed') return 'text-green-600';
    if (daysFromNow < 0) return 'text-red-600';
    if (daysFromNow <= 1) return 'text-yellow-600';
    return 'text-slate-600';
  };

  // Calculate task row color border
  const getTaskRowColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysFromNow = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (task.status === 'completed') return 'border-green-500';
    if (daysFromNow < 0) return 'border-red-500';
    if (daysFromNow <= 1) return 'border-yellow-500';
    return 'border-slate-200';
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setIsDirty(true);
    onSubmit({
      ...task,
      status: newStatus,
      owner,
    });
  };

  // Handle owner change
  const handleOwnerChange = (newOwner) => {
    setOwner(newOwner);
    setIsDirty(true);
    onSubmit({
      ...task,
      status,
      owner: newOwner,
    });
  };

  // Status options with readable labels
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
  ];

  return (
    <div
      data-testid={`task-row-${task.id}`}
      className={`flex items-center gap-4 p-3 border-l-4 ${getTaskRowColor(
        task.dueDate
      )} bg-white rounded-lg hover:bg-slate-50 transition-colors`}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {task.status === 'completed' ? (
          <div
            data-testid="checkmark-icon"
            className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
        )}
      </div>

      {/* Task Name */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.status === 'completed'
              ? 'line-through text-slate-500'
              : 'text-slate-900'
          }`}
        >
          {task.name}
        </p>
      </div>

      {/* Status Dropdown */}
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        aria-label={`Status for ${task.name}`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Owner Field */}
      {isEditable ? (
        <input
          type="text"
          value={owner}
          onChange={(e) => handleOwnerChange(e.target.value)}
          placeholder="Owner"
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
          aria-label={`Owner for ${task.name}`}
        />
      ) : (
        <div className="px-3 py-1.5 text-sm text-slate-600 whitespace-nowrap">
          {owner}
        </div>
      )}

      {/* Due Date */}
      <div className="flex-shrink-0">
        <p
          data-testid="due-date-label"
          className={`text-xs font-medium ${getDueDateColor(task.dueDate)}`}
        >
          {new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
