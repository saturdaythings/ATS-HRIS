/**
 * TimelinePreview Component
 * Visual timeline showing tasks positioned at their due dates
 */
const timelinePoints = [
  { label: 'Pre-Onboarding', days: -14, description: '2 weeks before' },
  { label: 'Day 0', days: 0, description: 'Start date' },
  { label: 'Week 1', days: 7, description: '1 week in' },
  { label: '30 Days', days: 30, description: '1 month' },
  { label: '90 Days', days: 90, description: '3 months' },
];

const ownerRoleColors = {
  'onboarding-manager': '#3b82f6', // blue
  'manager': '#a855f7', // purple
  'hr': '#10b981', // emerald
  'team-lead': '#f97316', // orange
};

export default function TimelinePreview({ track }) {
  if (!track || !track.tasks || track.tasks.length === 0) {
    return (
      <div className="text-center text-slate-600">
        <p>No tasks scheduled</p>
      </div>
    );
  }

  // Group tasks by timeline point
  const getTimelineSection = (dueDaysOffset) => {
    if (dueDaysOffset < 0) return -14;
    if (dueDaysOffset === 0) return 0;
    if (dueDaysOffset <= 7) return 7;
    if (dueDaysOffset <= 30) return 30;
    return 90;
  };

  const tasksBySection = {};
  timelinePoints.forEach(point => {
    tasksBySection[point.days] = [];
  });

  track.tasks.forEach(task => {
    const section = getTimelineSection(task.dueDaysOffset);
    tasksBySection[section].push(task);
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline Preview</h3>

        {/* Timeline visualization */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 to-slate-300"></div>

          {/* Timeline points */}
          <div className="relative space-y-8">
            {timelinePoints.map((point) => (
              <div key={point.days} data-timeline-section={point.days}>
                {/* Point marker */}
                <div className="flex items-start gap-4">
                  <div className="relative pt-1">
                    <div className="w-3 h-3 bg-slate-400 rounded-full relative z-10"></div>
                  </div>

                  {/* Point label and tasks */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h4 className="font-semibold text-slate-900">{point.label}</h4>
                      <p className="text-xs text-slate-600">{point.description}</p>
                    </div>

                    {/* Tasks at this point */}
                    {tasksBySection[point.days] && tasksBySection[point.days].length > 0 ? (
                      <div className="space-y-2">
                        {tasksBySection[point.days].map((task) => (
                          <div
                            key={task.id}
                            data-owner-role={task.ownerRole}
                            role="tooltip"
                            title={task.description}
                            className="p-3 bg-white rounded-lg border-l-4 hover:shadow-md transition-shadow"
                            style={{
                              borderLeftColor: ownerRoleColors[task.ownerRole] || '#94a3b8',
                              backgroundColor: '#f8fafc',
                            }}
                          >
                            <p className="font-medium text-sm text-slate-900">
                              {task.name}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-600 mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{
                                  backgroundColor:
                                    ownerRoleColors[task.ownerRole] || '#64748b',
                                }}
                              >
                                {task.ownerRole}
                              </span>
                              <span className="text-xs text-slate-600">
                                Day {task.dueDaysOffset >= 0 ? '+' : ''}
                                {task.dueDaysOffset}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No tasks</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color legend */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-3">Owner Roles</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(ownerRoleColors).map(([role, color]) => (
            <div key={role} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-slate-700">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
