/**
 * AddCandidateModal Component
 * Modal for creating a new candidate with resume upload
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
import ResumeUploadForm from '../forms/ResumeUploadForm';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddCandidateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    stage: 'sourced',
    status: 'active',
    resumeUrl: '',
  });

  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleResumeUpload = (fileInfo) => {
    setFormData((prev) => ({
      ...prev,
      resumeUrl: fileInfo.url,
    }));
    setShowResumeUpload(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.role.trim()) {
      setError('Role is required');
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        role: '',
        stage: 'sourced',
        status: 'active',
        resumeUrl: '',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create candidate');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Add Candidate
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-slate-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Resume
              </label>
              {!showResumeUpload ? (
                <button
                  type="button"
                  onClick={() => setShowResumeUpload(true)}
                  className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                    formData.resumeUrl
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {formData.resumeUrl ? '✓ Resume uploaded' : 'Upload Resume'}
                </button>
              ) : (
                <ResumeUploadForm
                  onUpload={handleResumeUpload}
                  onCancel={() => setShowResumeUpload(false)}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

AddCandidateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default AddCandidateModal;
