/**
 * Candidates ATS Page
 * Complete candidate management with CRUD, resume uploads, interviews, and offers
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import useCandidates from '../hooks/useCandidates';
import AddCandidateModal from '../components/modals/AddCandidateModal';
import CandidateDetailPanel from '../components/panels/CandidateDetailPanel';
import SearchInput from '../components/common/SearchInput';
import LoadingState from '../components/common/LoadingState';
import ErrorBanner from '../components/common/ErrorBanner';
import CandidateStageWidget from '../components/widgets/CandidateStageWidget';
import { useTableState } from '../hooks/useTableState';
import FilterChip from '../components/common/FilterChip';
import ColumnVisibilityToggle from '../components/common/ColumnVisibilityToggle';

const STAGES = [
  { value: 'all', label: 'All Stages' },
  { value: 'sourced', label: 'Sourced' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
];

const STAGE_OPTIONS = ['sourced', 'screening', 'interview', 'offer', 'hired'];
const ALL_COLUMNS = ['name', 'email', 'roleApplied', 'stage', 'status', 'createdAt'];

const STAGE_COLORS = {
  sourced: 'bg-blue-50 border-blue-200 text-blue-700',
  screening: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  interview: 'bg-purple-50 border-purple-200 text-purple-700',
  offer: 'bg-green-50 border-green-200 text-green-700',
  hired: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export default function Candidates() {
  const {
    candidates,
    loading,
    error,
    fetchCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidatesByStage,
    getCountByStage,
  } = useCandidates();

  const tableState = useTableState('candidates', ALL_COLUMNS, 'createdAt', 'desc');

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filter and sort candidates
  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates;

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(c => c.stage === stageFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.roleApplied?.toLowerCase().includes(term)
      );
    }

    // Apply table state filters and sort
    filtered = tableState.applyFilters(filtered);
    filtered = tableState.applySort(filtered);

    return filtered;
  }, [candidates, stageFilter, searchTerm, tableState]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle add candidate
  const handleAddCandidate = useCallback(async (formData) => {
    try {
      setIsSubmitting(true);
      await createCandidate(formData);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add candidate:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [createCandidate]);

  // Handle update candidate
  const handleUpdateCandidate = useCallback(async (candidateId, updates) => {
    try {
      await updateCandidate(candidateId, updates);
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate({ ...selectedCandidate, ...updates });
      }
    } catch (err) {
      console.error('Failed to update candidate:', err);
    }
  }, [selectedCandidate, updateCandidate]);

  // Handle delete candidate
  const handleDeleteCandidate = useCallback(async (candidateId) => {
    try {
      await deleteCandidate(candidateId);
      if (selectedCandidate?.id === candidateId) {
        setIsDetailPanelOpen(false);
        setSelectedCandidate(null);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete candidate:', err);
    }
  }, [selectedCandidate, deleteCandidate]);

  // Handle candidate selection
  const handleSelectCandidate = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailPanelOpen(true);
  }, []);

  // Handle sort column
  const handleSort = (column) => {
    tableState.handleSortClick(column);
    setCurrentPage(1);
  };

  // Get stage counts
  const stageCounts = getCountByStage();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Candidates</h1>
              <p className="text-neutral-600 mt-1">Manage your hiring pipeline and candidate profiles</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Add Candidate
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Error Banner */}
        {error && <ErrorBanner message={error} />}

        {/* Stage Overview Widget */}
        <div className="mb-8">
          <CandidateStageWidget />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6 shadow-sm">
          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search Candidates
            </label>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, or role..."
            />
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-neutral-600">Filters:</span>

            {/* Stage filter - traditional select for now */}
            <div className="inline-block">
              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                {STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional filter chips can be added here */}
            <FilterChip
              label="Status"
              options={['active', 'inactive', 'archived']}
              selected={tableState.filters.status || []}
              onChange={(value) => tableState.updateFilter('status', value)}
            />

            {tableState.getActiveFilterCount() > 0 && (
              <button
                onClick={() => tableState.clearFilters()}
                className="ml-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear chip filters
              </button>
            )}

            <div className="flex-grow" />

            <ColumnVisibilityToggle
              allColumns={ALL_COLUMNS}
              visibleColumns={tableState.visibleColumns}
              onToggle={(col) => tableState.toggleColumnVisibility(col)}
            />
          </div>
        </div>

        {/* Candidates Table */}
        {loading && <LoadingState message="Loading candidates..." />}

        {!loading && filteredAndSortedCandidates.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No candidates found</h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || stageFilter !== 'all'
                ? 'Try adjusting your filters or search criteria'
                : 'Get started by adding your first candidate'}
            </p>
            {searchTerm === '' && stageFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors inline-block"
              >
                Add Candidate
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {tableState.visibleColumns.includes('name') && (
                      <th
                        onClick={() => handleSort('name')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {tableState.sortColumn === 'name' && (
                            <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    {tableState.visibleColumns.includes('email') && (
                      <th
                        onClick={() => handleSort('email')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Email
                          {tableState.sortColumn === 'email' && (
                            <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    {tableState.visibleColumns.includes('roleApplied') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('roleApplied')}
                      >
                        <div className="flex items-center gap-2">
                          Role
                          {tableState.sortColumn === 'roleApplied' && (
                            <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    {tableState.visibleColumns.includes('stage') && (
                      <th
                        onClick={() => handleSort('stage')}
                        className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Stage
                          {tableState.sortColumn === 'stage' && (
                            <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    {tableState.visibleColumns.includes('status') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {tableState.sortColumn === 'status' && (
                            <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    {tableState.visibleColumns.includes('createdAt') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-2">
                          Date Added
                          {tableState.sortColumn === 'createdAt' && (
                            <span className="text-sm">{tableState.sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedCandidates.map(candidate => (
                    <tr
                      key={candidate.id}
                      onClick={() => handleSelectCandidate(candidate)}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      {tableState.visibleColumns.includes('name') && (
                        <td className="px-6 py-4">
                          <p className="font-medium text-neutral-900">{candidate.name}</p>
                        </td>
                      )}
                      {tableState.visibleColumns.includes('email') && (
                        <td className="px-6 py-4 text-neutral-600 text-sm">{candidate.email}</td>
                      )}
                      {tableState.visibleColumns.includes('roleApplied') && (
                        <td className="px-6 py-4 text-neutral-600 text-sm">{candidate.roleApplied || candidate.role || '-'}</td>
                      )}
                      {tableState.visibleColumns.includes('stage') && (
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[candidate.stage] || ''}`}>
                            {candidate.stage?.charAt(0).toUpperCase() + candidate.stage?.slice(1)}
                          </span>
                        </td>
                      )}
                      {tableState.visibleColumns.includes('status') && (
                        <td className="px-6 py-4 text-neutral-600 text-sm">{candidate.status || '-'}</td>
                      )}
                      {tableState.visibleColumns.includes('createdAt') && (
                        <td className="px-6 py-4 text-neutral-600 text-sm">
                          {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCandidate(candidate);
                          }}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(candidate.id);
                          }}
                          className="text-red-600 hover:text-red-700 font-medium text-sm ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedCandidates.length)} of {filteredAndSortedCandidates.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCandidate}
        isSubmitting={isSubmitting}
      />

      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedCandidate(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Candidate</h3>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete this candidate? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCandidate(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
