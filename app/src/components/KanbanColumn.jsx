/**
 * KanbanColumn Component
 * Single Kanban column for a hiring stage
 */
import PropTypes from 'prop-types';

const stageConfig = {
  sourced: {
    label: 'Sourced',
    color: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
  },
  screening: {
    label: 'Screening',
    color: 'bg-yellow-50',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  interview: {
    label: 'Interview',
    color: 'bg-purple-50',
    badgeColor: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
  },
  offer: {
    label: 'Offer',
    color: 'bg-pink-50',
    badgeColor: 'bg-pink-100 text-pink-800',
    borderColor: 'border-pink-200',
  },
  hired: {
    label: 'Hired',
    color: 'bg-green-50',
    badgeColor: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
  },
};

function KanbanColumn({
  stage,
  candidates = [],
  onSelectCandidate = undefined,
  onDragStart = undefined,
  onDragOver = undefined,
  onDrop = undefined,
}) {
  const config = stageConfig[stage] || stageConfig.sourced;
  const count = candidates.length;

  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver?.(stage);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(stage);
  };

  return (
    <div
      className={`${config.color} rounded-lg border-2 ${config.borderColor} flex flex-col h-full min-h-[600px] md:min-h-[500px]`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">{config.label}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}>
            {count}
          </span>
        </div>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {candidates.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-gray-300 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs">No candidates</p>
            </div>
          </div>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              draggable
              role="button"
              tabIndex={0}
              aria-label={`${candidate.name} - ${candidate.role}`}
              onDragStart={(e) => onDragStart?.(candidate.id, stage, e)}
              onClick={() => onSelectCandidate?.(candidate)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectCandidate?.(candidate);
                }
              }}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all group"
            >
              {/* Candidate Card */}
              <div className="space-y-2">
                {/* Name */}
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900 text-sm truncate flex-1 group-hover:text-purple-600 transition-colors">
                    {candidate.name}
                  </h4>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-purple-400 flex-shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Email */}
                <p className="text-xs text-gray-600 truncate">{candidate.email}</p>

                {/* Role */}
                <p className="text-xs text-gray-500">{candidate.role}</p>

                {/* Status Badge */}
                {candidate.status && (
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(
                        candidate.status
                      )}`}
                    >
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </div>
                )}

                {/* Resume indicator */}
                {candidate.resumeUrl && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 pt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7H4v5h11V7z" />
                    </svg>
                    <span>Resume attached</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getStatusBadgeColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

KanbanColumn.propTypes = {
  stage: PropTypes.string.isRequired,
  candidates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.string,
      resumeUrl: PropTypes.string,
    })
  ),
  onSelectCandidate: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
};

export default KanbanColumn;
