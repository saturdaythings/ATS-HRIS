/**
 * MetricsCard - Displays a single metric with icon and trend
 */
export default function MetricsCard({ label, value, icon, trend, color = 'neutral' }) {
  const colorClasses = {
    neutral: 'bg-neutral-50 border-neutral-200 text-neutral-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const trendClasses = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-neutral-500',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-700 font-semibold text-sm">{label}</h3>
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold">{value !== undefined ? value : 'N/A'}</p>
      {trend && (
        <p className={`text-xs ${trendClasses[trend.direction]} mt-2`}>
          {trend.direction === 'up' && '↑'} {trend.direction === 'down' && '↓'} {trend.text}
        </p>
      )}
    </div>
  );
}
