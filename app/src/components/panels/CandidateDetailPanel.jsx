/**
 * CandidateDetailPanel Component
 * Rippling-style slide-in panel for candidate editing
 */
import { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import Timeline from '../common/Timeline';
import ResumeUploadForm from '../forms/ResumeUploadForm';
import PromoteModal from '../modals/PromoteModal';

export default function CandidateDetailPanel({ candidate, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    stage: 'sourced',
    status: 'active',
    notes: '',
    resumeUrl: '',
  });

  const [activities] = useState([
    {
      id: 1,
      action: 'Candidate created',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      action: 'Moved to Screening stage',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      action: 'Resume uploaded',
      description: 'candidate-resume.pdf',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Initialize form data when candidate changes
  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        email: candidate.email || '',
        role: candidate.role || '',
        stage: candidate.stage || 'sourced',
        status: candidate.status || 'active',
        notes: candidate.notes || '',
        resumeUrl: candidate.resumeUrl || '',
      });
      setIsEditing(false);
      setActiveTab('overview');
    }
  }, [candidate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Call API to save candidate
    setIsEditing(false);
  };

  const handlePromote = (promotionData) => {
    // TODO: Call API to promote candidate to employee
    console.log('Promote candidate:', promotionData);
    setShowPromoteModal(false);
    onClose();
  };

  const handleResumeUpload = (fileInfo) => {
    // TODO: Upload to storage and update resumeUrl
    setFormData(prev => ({
      ...prev,
      resumeUrl: fileInfo.url,
    }));
    setShowResumeUpload(false);
  };

  if (!isOpen || !candidate) return null;

  const getStatusVariant = (status) => {
    const variants = {
      active: 'active',
      rejected: 'rejected',
      hired: 'active',
    };
    return variants[status] || 'default';
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[40%] lg:w-[35%] bg-white shadow-xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">{formData.name}</h2>
              <p className="text-sm text-slate-600 mt-1">{formData.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant={getStatusVariant(formData.status)}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </Badge>
                <Badge variant="info">{formData.stage}</Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 border-b border-slate-200 flex gap-6">
          {['overview', 'resume', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {!isEditing ? (
                <>
                  {/* Display Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                      <p className="text-slate-900">{formData.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                      <p className="text-slate-900">{formData.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role</label>
                      <p className="text-slate-900">{formData.role}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stage</label>
                      <p className="text-slate-900 capitalize">{formData.stage}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                      <p className="text-slate-900 capitalize">{formData.status}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes</label>
                      <p className="text-slate-900">{formData.notes || '-'}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => setShowPromoteModal(true)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Promote to Employee
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Move Stage
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Stage</label>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="sourced">Sourced</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              {formData.resumeUrl ? (
                <>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7H4v5h11V7z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-900">Resume attached</p>
                    <p className="text-xs text-slate-600 mt-1">candidate-resume.pdf</p>
                    <div className="flex gap-2 mt-3 justify-center">
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        View
                      </button>
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResumeUpload(true)}
                    className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Replace Resume
                  </button>
                </>
              ) : (
                <>
                  {!showResumeUpload ? (
                    <button
                      onClick={() => setShowResumeUpload(true)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Upload Resume
                    </button>
                  ) : (
                    <ResumeUploadForm
                      onUpload={handleResumeUpload}
                      onCancel={() => setShowResumeUpload(false)}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity Timeline</h3>
              <Timeline activities={activities} />
            </div>
          )}
        </div>
      </div>

      {/* Promote Modal */}
      {showPromoteModal && (
        <PromoteModal
          candidate={candidate}
          onConfirm={handlePromote}
          onCancel={() => setShowPromoteModal(false)}
        />
      )}
    </>
  );
}
