/**
 * ProgressBar Component - Visual progress indicator
 * Used in onboarding checklists and task tracking
 * Provides smooth animation, accessible labels, and WCAG AA contrast
 */
export default function ProgressBar({
  completed = 0,
  total = 0,
  label = true,
  size = 'md',
  showPercentage = true,
  ariaLabel = null,
  className = '',
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const containerPadding = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div className={`w-full space-y-2 ${className}`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage} aria-label={ariaLabel || 'Progress indicator'}>
      {label && (
        <div className={`flex justify-between items-center ${containerPadding[size]}`}>
          <span className="text-sm font-medium text-neutral-700">Progress</span>
          <span className="text-sm font-medium text-neutral-600" aria-live="polite">
            {completed}/{total}
          </span>
        </div>
      )}

      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-normal"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>

      {label && showPercentage && (
        <div className="text-xs text-neutral-500 font-medium" aria-live="polite">
          {percentage}% complete
        </div>
      )}
    </div>
  );
}
