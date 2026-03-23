/**
 * ResumeUploadForm Component
 * Drag-drop zone for PDF/DOCX files with validation and upload progress
 */
import { useState } from 'react';

export default function ResumeUploadForm({ onUpload, onCancel }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.some(ext => file.name.endsWith(ext))) {
      return 'Only PDF and DOCX files are accepted';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);
    setSuccess(false);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 30;
          return next > 90 ? 90 : next;
        });
      }, 300);

      // Simulate upload delay - in real app, would call API
      await new Promise(resolve => setTimeout(resolve, 1500));
      clearInterval(progressInterval);
      setProgress(100);

      // Call parent callback with file info
      onUpload({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date(),
        url: URL.createObjectURL(file), // Mock URL
      });

      setSuccess(true);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 800);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag-drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative p-8 rounded-lg border-2 border-dashed transition-colors
          ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-slate-300 bg-slate-50'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {!isUploading && !success && (
          <>
            <input
              type="file"
              onChange={handleFileInput}
              accept=".pdf,.docx"
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M32 4v12M26 10h12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium text-slate-900">
                Drag and drop your resume here
              </p>
              <p className="text-xs text-slate-600 mt-1">
                PDF or DOCX, max 10MB
              </p>
            </div>
          </>
        )}

        {isUploading && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-purple-600 mx-auto mb-3 animate-spin" />
            <p className="text-sm font-medium text-slate-900">Uploading...</p>
            <p className="text-xs text-slate-600 mt-1">{Math.round(progress)}%</p>
          </div>
        )}

        {success && (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-slate-900">Upload successful</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isUploading && progress > 0 && (
        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      {success && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSuccess(false);
              setProgress(0);
            }}
            className="flex-1 px-3 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Upload Another
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
