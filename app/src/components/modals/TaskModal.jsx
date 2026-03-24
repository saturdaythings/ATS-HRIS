/**
 * TaskModal Component
 * Modal for creating and editing tasks
 */
import { useState, useEffect } from 'react';
import TaskForm from '../TaskForm';

const DEFAULT_OWNER_ROLES = [
  'onboarding-manager',
  'manager',
  'hr',
  'team-lead',
];

export default function TaskModal({
  isOpen,
  mode = 'create',
  task,
  onClose,
  onSubmit,
  isSubmitting = false,
  ownerRoles = DEFAULT_OWNER_ROLES,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'create' ? 'Create Task' : 'Edit Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-slate-900"
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

          {/* Content */}
          <div className="p-6">
            <TaskForm
              mode={mode}
              task={task}
              ownerRoles={ownerRoles}
              onSubmit={onSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  );
}
