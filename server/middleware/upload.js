import multer from 'multer';
import {
  validateResumeFile,
  getMaxFileSize,
  getAllowedExtensions,
} from '../services/resumeUploadService.js';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

// File filter for resume uploads
const fileFilter = (req, file, cb) => {
  // Validate file before accepting
  const validation = validateResumeFile(file);

  if (!validation.valid) {
    cb(new Error(validation.error));
  } else {
    cb(null, true);
  }
};

// Create multer instance for resume uploads
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
  },
});

/**
 * Multer middleware for single resume file upload
 * Handles 'resume' field name
 */
export const uploadResume = upload.single('resume');

/**
 * Multer middleware for resume file upload with 'file' field name
 * Used in API endpoints: POST /api/candidates/:id/resumes
 */
export const uploadFile = upload.single('file');

/**
 * Multer middleware for multiple resume file uploads
 * Handles 'resumes' field name
 */
export const uploadResumes = upload.array('resumes', 10);

export default upload;
