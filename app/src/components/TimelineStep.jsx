/**
 * TimelineStep Component
 * Visual timeline step for onboarding phases
 * Shows phase name, item count, completion status, and expandable item list
 */
import { useState } from 'react';

export default function TimelineStep({
  label,
  completed = false,
  items = [],
  onClick,
  variant = 'default',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onClick) {
      onClick(!isExpanded);
    }
  };

  const completedItems = items.filter((item) => item.completed).length;
  const percentage =
    items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;

  return (
    <div className="relative">
      {/* Timeline line connector (if not last) */}
      <div className="absolute left-6 top-16 w-0.5 h-12 bg-slate-200" />

      {/* Step container */}
      <button
        onClick={handleToggle}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-4 hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-4">
          {/* Timeline dot with status indicator */}
          <div className="flex flex-col items-center pt-1">
            <div
              className={`w-4 h-4 rounded-full ring-4 transition-colors ${
                completed
                  ? 'bg-green-600 ring-green-100'
                  : 'bg-slate-300 ring-slate-100'
              }`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{label}</h3>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
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
            </div>

            {/* Task count and progress */}
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {items.length} task{items.length !== 1 ? 's' : ''}
              </span>
              {items.length > 0 && (
                <span className="text-xs text-slate-500">
                  {completedItems}/{items.length} •{' '}
                  <span
                    className={
                      completed ? 'text-green-600' : 'text-slate-500'
                    }
                  >
                    {percentage}% complete
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expandable items list */}
      {isExpanded && items.length > 0 && (
        <div className="ml-12 mt-2 space-y-2 pb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm ${
                item.completed ? 'text-slate-500' : 'text-slate-700'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {item.completed ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <span className={item.completed ? 'line-through' : ''}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
