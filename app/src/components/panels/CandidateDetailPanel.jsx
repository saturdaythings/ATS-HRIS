/**
 * CandidateDetailPanel Component
 * Rippling-style slide-in panel for candidate editing
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Badge from '../common/Badge';
import Timeline from '../common/Timeline';
import DatePicker from '../common/DatePicker';
import ResumeUploadForm from '../forms/ResumeUploadForm';
import PromoteModal from '../modals/PromoteModal';

export default function CandidateDetailPanel({ candidate, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    roleApplied: '',
    stage: 'sourced',
    status: 'active',
    notes: '',
    resumeUrl: '',
    skills: [],
    sourcedAt: new Date(),
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

  const [interviews] = useState([
    {
      id: 1,
      date: 'Mar 25, 2026 \u00b7 2:00 PM',
      format: 'Video',
      interviewers: [
        { name: 'J. Kim', role: 'Tech Lead', recommendation: 'hire' },
        { name: 'T. Park', role: 'PM', recommendation: 'maybe' },
      ],
      feedback: 'Strong systems thinking. Needs follow-up on client-facing exp.',
    },
    {
      id: 2,
      date: 'Mar 18, 2026 \u00b7 10:00 AM',
      format: 'Phone',
      interviewers: [
        { name: 'R. Patel', role: 'Screening', recommendation: 'hire' },
      ],
      feedback: 'Good comms. Clear alignment on role scope.',
    },
  ]);

  const [interviewActivities] = useState([
    {
      id: 1,
      dotColor: '#3b82f6',
      text: 'Stage',
      detail: 'moved to Interview',
      time: 'Mar 18 \u00b7 R. Patel',
    },
    {
      id: 2,
      dotColor: '#aaa',
      text: 'Interview',
      detail: 'logged \u00b7 Phone screen',
      time: 'Mar 18',
    },
    {
      id: 3,
      dotColor: '#aaa',
      text: 'Candidate',
      detail: 'added \u00b7 LinkedIn',
      time: 'Mar 10',
    },
  ]);

  const [resumes] = useState([
    {
      id: 1,
      fileName: 'jane-smith-resume.pdf',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      url: '/resumes/jane-smith-resume.pdf',
    },
  ]);

  // Available skills (would come from ConfigList in real app)
  const availableSkills = [
    'JavaScript',
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'SQL',
    'CSS',
    'HTML',
    'Git',
    'Docker',
    'AWS',
    'GraphQL',
  ];

  // Initialize form data when candidate changes
  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        roleApplied: candidate.roleApplied || candidate.role || '',
        stage: candidate.stage || 'sourced',
        status: candidate.status || 'active',
        notes: candidate.notes || '',
        resumeUrl: candidate.resumeUrl || '',
        skills: candidate.skills || [],
        sourcedAt: candidate.sourcedAt ? new Date(candidate.sourcedAt) : new Date(),
      });
      setSelectedSkills(candidate.skills || []);
      setIsEditing(false);
      setActiveTab('overview');
    }
  }, [candidate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to save candidate
      // await fetch(`/api/candidates/${candidate.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save candidate:', error);
    }
  };

  const handlePromote = async (promotionData) => {
    try {
      // TODO: Call API to promote candidate to employee
      // await fetch(`/api/candidates/${candidate.id}/promote`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(promotionData),
      // });
      setShowPromoteModal(false);
      onClose();
    } catch (error) {
      console.error('Failed to promote candidate:', error);
    }
  };

  const handleResumeUpload = async (fileInfo) => {
    try {
      // TODO: Upload to storage and update resumeUrl
      // await fetch(`/api/candidates/${candidate.id}/resume`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: fileInfo.url }),
      // });
      setFormData(prev => ({
        ...prev,
        resumeUrl: fileInfo.url,
      }));
      setShowResumeUpload(false);
    } catch (error) {
      console.error('Failed to upload resume:', error);
    }
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
        <div className="flex-shrink-0 px-6 border-b border-slate-200 flex gap-6 overflow-x-auto">
          {['overview', 'resume', 'interviews', 'skills', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                }
              `}
            >
              {tab === 'interviews' ? 'Interviews' : tab === 'skills' ? 'Skills' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                      <p className="text-slate-900">{formData.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Location</label>
                      <p className="text-slate-900">{formData.location || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role Applied</label>
                      <p className="text-slate-900">{formData.roleApplied || '-'}</p>
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
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sourced At</label>
                      <p className="text-slate-900">
                        {formData.sourcedAt ? new Date(formData.sourcedAt).toLocaleDateString() : '-'}
                      </p>
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
                      <label className="block text-sm font-medium text-slate-900 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Role Applied</label>
                      <input
                        type="text"
                        name="roleApplied"
                        value={formData.roleApplied}
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
                      <DatePicker
                        label="Sourced At"
                        value={formData.sourcedAt}
                        onChange={(date) => setFormData(prev => ({ ...prev, sourcedAt: date }))}
                        helperText="Date when candidate was added to the pipeline"
                      />
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
              {resumes.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {resumes.map(resume => (
                      <div key={resume.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7H4v5h11V7z" />
                              </svg>
                              <h4 className="font-medium text-slate-900">{resume.fileName}</h4>
                              {resume.isActive && (
                                <Badge variant="active">Active</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              Uploaded {resume.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                              View
                            </button>
                            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                              Download
                            </button>
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowResumeUpload(true)}
                    className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Upload Another Resume
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

              {showResumeUpload && resumes.length > 0 && (
                <ResumeUploadForm
                  onUpload={handleResumeUpload}
                  onCancel={() => setShowResumeUpload(false)}
                />
              )}
            </div>
          )}

          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <div>
              <div className="sec-head">Interview history</div>
              {interviews.length > 0 ? (
                interviews.map(interview => (
                  <div key={interview.id} className="int-card">
                    <div className="int-card-top">
                      <div className="int-card-date">{interview.date}</div>
                      <span className="int-fmt">{interview.format}</span>
                    </div>
                    {interview.interviewers.map((interviewer, idx) => (
                      <div key={idx} className="int-card-interviewer">
                        <div>
                          <span className="int-name">{interviewer.name}</span>{' '}
                          <span className="int-role">&middot; {interviewer.role}</span>
                        </div>
                        <span className={`rec-${interviewer.recommendation}`}>
                          {interviewer.recommendation === 'hire' ? 'Hire' : interviewer.recommendation === 'maybe' ? 'Maybe' : 'No'}
                        </span>
                      </div>
                    ))}
                    {interview.feedback && (
                      <div className="int-feedback">{interview.feedback}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-center py-8">No interviews scheduled yet</p>
              )}

              <div className="sec-head">Activity</div>
              {interviewActivities.map(activity => (
                <div key={activity.id} className="act-item">
                  <div className="act-dot" style={{ background: activity.dotColor }} />
                  <div>
                    <div className="act-text">
                      <span className="act-bold">{activity.text}</span> {activity.detail}
                    </div>
                    <div className="act-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">Select relevant skills for this candidate</p>
              <div className="grid grid-cols-2 gap-3">
                {availableSkills.map(skill => (
                  <label key={skill} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills(prev => [...prev, skill]);
                          setFormData(prev => ({
                            ...prev,
                            skills: [...prev.skills, skill],
                          }));
                        } else {
                          setSelectedSkills(prev => prev.filter(s => s !== skill));
                          setFormData(prev => ({
                            ...prev,
                            skills: prev.skills.filter(s => s !== skill),
                          }));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-900">{skill}</span>
                  </label>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Selected Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                      <span
                        key={skill}
                        className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
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

CandidateDetailPanel.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    location: PropTypes.string,
    roleApplied: PropTypes.string,
    role: PropTypes.string,
    stage: PropTypes.string,
    status: PropTypes.string,
    notes: PropTypes.string,
    resumeUrl: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
  }) || PropTypes.null,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
