/**
 * Badge Component - Status, role, and category badges
 * Used in detail panels and tables
 * Supports 6 variants with consistent styling and color contrast (WCAG AA)
 */
export default function Badge({ children, variant = 'default', size = 'md', ariaLabel = null }) {
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    active: 'bg-success-100 text-success-700 border border-success-200',
    inactive: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    rejected: 'bg-error-100 text-error-700 border border-error-200',
    pending: 'bg-warning-100 text-warning-700 border border-warning-200',
    info: 'bg-info-100 text-info-700 border border-info-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs font-medium rounded-sm',
    md: 'px-3 py-1.5 text-sm font-medium rounded-md',
    lg: 'px-4 py-2 text-base font-medium rounded-lg',
  };

  return (
    <span
      className={`inline-block whitespace-nowrap transition-colors duration-fast ${variantClasses[variant]} ${sizeClasses[size]}`}
      role="status"
      aria-label={ariaLabel || `${variant} badge`}
    >
      {children}
    </span>
  );
}
