import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'resumes');
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Generate a unique filename with hash prefix
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename with hash prefix
 */
export function generateFileName(originalName) {
  // Generate 8 random bytes and convert to hex (16 character hex string)
  const hash = crypto.randomBytes(8).toString('hex');
  return `${hash}_${originalName}`;
}

/**
 * Validate resume file before upload
 * @param {Object} file - File object from multer
 * @param {string} file.originalname - Original filename
 * @param {string} file.mimetype - MIME type
 * @param {number} file.size - File size in bytes
 * @returns {Object} {valid: boolean, error?: string}
 */
export function validateResumeFile(file) {
  // Check file exists and has name
  if (!file || !file.originalname) {
    return { valid: false, error: 'File name is required' };
  }

  // Extract extension
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Only pdf or docx files are allowed.`,
    };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid MIME type. Expected application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document, got ${file.mimetype}`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Save resume file to disk
 * @param {Buffer} fileBuffer - File buffer content
 * @param {string} originalName - Original filename
 * @returns {Promise<Object>} {filename: string, url: string}
 */
export async function saveResumeFile(fileBuffer, originalName) {
  // Create upload directory if it doesn't exist
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Generate unique filename
  const filename = generateFileName(originalName);
  const filePath = path.join(UPLOAD_DIR, filename);

  // Write file to disk
  await fs.promises.writeFile(filePath, fileBuffer);

  // Return file URL and filename
  return {
    filename,
    url: `/api/resumes/${filename}`,
  };
}

/**
 * Cleanup old resume uploads based on retention period
 * @param {number} retentionDays - Number of days to retain files (default: 30)
 * @returns {Promise<Object>} {deletedCount: number, error?: string}
 */
export async function cleanupOldUploads(retentionDays = 30) {
  try {
    // Check if upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      return { deletedCount: 0 };
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      // Delete if older than retention period
      if (fileAge > retentionMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    return { deletedCount };
  } catch (error) {
    return {
      deletedCount: 0,
      error: `Cleanup failed: ${error.message}`,
    };
  }
}

/**
 * Get file from disk
 * @param {string} filename - Filename to retrieve
 * @returns {Promise<Buffer>} File buffer
 */
export async function getResumeFile(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);

  // Validate filename to prevent directory traversal
  if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR))) {
    throw new Error('Invalid file path');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  return fs.promises.readFile(filePath);
}

/**
 * Delete a resume file
 * @param {string} filename - Filename to delete
 * @returns {Promise<void>}
 */
export async function deleteResumeFile(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);

  // Validate filename to prevent directory traversal
  if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR))) {
    throw new Error('Invalid file path');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  await fs.promises.unlink(filePath);
}

/**
 * Get upload directory path
 * @returns {string} Upload directory path
 */
export function getUploadDir() {
  return UPLOAD_DIR;
}

/**
 * Get allowed file extensions
 * @returns {Array<string>} Allowed extensions
 */
export function getAllowedExtensions() {
  return ALLOWED_EXTENSIONS;
}

/**
 * Get maximum file size
 * @returns {number} Maximum file size in bytes
 */
export function getMaxFileSize() {
  return MAX_FILE_SIZE;
}
