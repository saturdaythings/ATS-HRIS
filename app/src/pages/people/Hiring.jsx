import { useState, useEffect } from 'react';
import KanbanBoard from '../../components/KanbanBoard';
import CandidateDetailPanel from '../../components/panels/CandidateDetailPanel';
import AddCandidateModal from '../../components/modals/AddCandidateModal';
import { useCandidates } from '../../hooks/useCandidates';

export default function Hiring() {
  const {
    candidates,
    loading,
    error,
    fetchCandidates,
    createCandidate,
    updateCandidate,
  } = useCandidates();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load candidates on mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        await fetchCandidates({ searchTerm });
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    };

    loadCandidates();
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle candidate search/filter
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    try {
      await fetchCandidates({ searchTerm: term });
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  /**
   * Handle stage change (drag and drop)
   */
  const handleStageChange = async (candidateId, newStage) => {
    try {
      await updateCandidate(candidateId, { stage: newStage });
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  /**
   * Handle add candidate
   */
  const handleAddCandidate = async (formData) => {
    setIsSubmitting(true);
    try {
      await createCandidate(formData);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create candidate:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Filter candidates based on search
   */
  const filteredCandidates = searchTerm
    ? candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : candidates;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredCandidates.length} candidates
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Candidate
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search candidates by name, email, or role..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-6">
        <KanbanBoard
          candidates={filteredCandidates}
          onSelectCandidate={setSelectedCandidate}
          onStageChange={handleStageChange}
          isLoading={loading}
          isMobile={isMobile}
        />
      </div>

      {/* Detail Panel */}
      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCandidate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
