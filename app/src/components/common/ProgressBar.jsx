/**
 * ProgressBar Component - Visual progress indicator
 * Used in onboarding checklists and task tracking
 */
export default function ProgressBar({ completed, total, label = true, size = 'md' }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm font-medium text-slate-600">{completed}/{total}</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && (
        <div className="mt-1 text-xs text-slate-500">{percentage}% complete</div>
      )}
    </div>
  );
}
