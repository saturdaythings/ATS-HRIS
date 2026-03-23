/**
 * Badge Component - Status, role, and category badges
 * Used in detail panels and tables
 */
export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs font-medium rounded',
    md: 'px-3 py-1 text-sm font-medium rounded-md',
    lg: 'px-4 py-2 text-base font-medium rounded-lg',
  };

  return (
    <span className={`inline-block ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
