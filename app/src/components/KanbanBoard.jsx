/**
 * KanbanBoard Component
 * Kanban-style pipeline view with multiple columns
 */
import { useState, useCallback } from 'react';
import KanbanColumn from './KanbanColumn';

const STAGES = ['sourced', 'screening', 'interview', 'offer', 'hired'];

export default function KanbanBoard({
  candidates = [],
  onSelectCandidate,
  onStageChange,
  isLoading = false,
  isMobile = false,
}) {
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [draggedFromStage, setDraggedFromStage] = useState(null);

  /**
   * Get candidates for a specific stage
   */
  const getCandidatesByStage = useCallback(
    (stage) => {
      return candidates.filter((c) => c.stage === stage);
    },
    [candidates]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((candidateId, stage, e) => {
    setDraggedCandidate(candidateId);
    setDraggedFromStage(stage);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  /**
   * Handle drag over (visual feedback)
   */
  const handleDragOver = useCallback((stage) => {
    // Visual feedback could be added here (e.g., highlight column)
  }, []);

  /**
   * Handle drop - move candidate to new stage
   */
  const handleDrop = useCallback(
    (newStage) => {
      if (!draggedCandidate || !draggedFromStage) return;

      // Only process if stage actually changed
      if (draggedFromStage !== newStage) {
        onStageChange?.(draggedCandidate, newStage);
      }

      setDraggedCandidate(null);
      setDraggedFromStage(null);
    },
    [draggedCandidate, draggedFromStage, onStageChange]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-purple-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600 font-medium">Loading candidates...</p>
        </div>
      </div>
    );
  }

  // Mobile: List view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {STAGES.map((stage) => {
          const stageTitle =
            stage.charAt(0).toUpperCase() + stage.slice(1);
          const stageCandidates = getCandidatesByStage(stage);

          return (
            <div key={stage} className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                {stageTitle} ({stageCandidates.length})
              </h3>
              <div className="space-y-2">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => onSelectCandidate?.(candidate)}
                    className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:border-purple-400 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">
                      {candidate.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {candidate.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {candidate.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: Kanban view
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-5 gap-4 min-w-max lg:min-w-full">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            candidates={getCandidatesByStage(stage)}
            onSelectCandidate={onSelectCandidate}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
