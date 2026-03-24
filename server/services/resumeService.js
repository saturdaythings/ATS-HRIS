import { db } from '../db.js';
import * as fileUploadService from './resumeUploadService.js';

/**
 * Resume Service
 * Handles CRUD operations for resume versioning and management
 */

/**
 * Upload a new resume version for a candidate
 * Auto-increment version, set as active, and deactivate previous active resume
 * @param {string} candidateId - Candidate ID
 * @param {Buffer} fileBuffer - File buffer content
 * @param {string} fileName - Original file name
 * @returns {Promise<Object>} Created resume with version and fileUrl
 */
export async function uploadResume(candidateId, fileBuffer, fileName) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Get the current max version for this candidate
  const latestResume = await db.resume.findFirst({
    where: { candidateId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const nextVersion = (latestResume?.version || 0) + 1;

  // Save file to disk
  const { url: fileUrl } = await fileUploadService.saveResumeFile(
    fileBuffer,
    fileName
  );

  // Deactivate previous active resume if exists
  await db.resume.updateMany({
    where: { candidateId, isActive: true },
    data: { isActive: false },
  });

  // Create new resume record
  const resume = await db.resume.create({
    data: {
      candidateId,
      fileUrl,
      fileName,
      version: nextVersion,
      isActive: true,
      uploadedAt: new Date(),
    },
  });

  return resume;
}

/**
 * List all resumes for a candidate
 * Ordered by version descending (newest first)
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Array>} List of resume records with version and isActive status
 */
export async function listResumes(candidateId) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const resumes = await db.resume.findMany({
    where: { candidateId },
    orderBy: { version: 'desc' },
  });

  return resumes;
}

/**
 * Set a resume as active and deactivate all others for the candidate
 * @param {string} candidateId - Candidate ID
 * @param {string} resumeId - Resume ID to activate
 * @returns {Promise<Object>} Updated resume record
 */
export async function setActiveResume(candidateId, resumeId) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Verify resume exists and belongs to candidate
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume || resume.candidateId !== candidateId) {
    throw new Error('Resume not found');
  }

  // Deactivate all other resumes for this candidate
  await db.resume.updateMany({
    where: { candidateId, NOT: { id: resumeId } },
    data: { isActive: false },
  });

  // Activate the specified resume
  const updated = await db.resume.update({
    where: { id: resumeId },
    data: { isActive: true },
  });

  return updated;
}

/**
 * Delete a specific resume version
 * @param {string} candidateId - Candidate ID
 * @param {string} resumeId - Resume ID to delete
 * @returns {Promise<void>}
 */
export async function deleteResume(candidateId, resumeId) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Verify resume exists and belongs to candidate
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume || resume.candidateId !== candidateId) {
    throw new Error('Resume not found');
  }

  // Delete file from disk
  try {
    const filename = resume.fileUrl.split('/').pop();
    await fileUploadService.deleteResumeFile(filename);
  } catch (error) {
    console.warn(
      `Warning: Could not delete file for resume ${resumeId}: ${error.message}`
    );
    // Continue with database deletion even if file deletion fails
  }

  // Delete resume record
  await db.resume.delete({
    where: { id: resumeId },
  });
}

/**
 * Get active resume for a candidate
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Object|null>} Active resume record or null
 */
export async function getActiveResume(candidateId) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const resume = await db.resume.findFirst({
    where: { candidateId, isActive: true },
  });

  return resume || null;
}

/**
 * Get a specific resume by ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} Resume record
 */
export async function getResume(resumeId) {
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  return resume;
}

/**
 * Get resume count for a candidate
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<number>} Count of resumes
 */
export async function getResumeCount(candidateId) {
  const count = await db.resume.count({
    where: { candidateId },
  });

  return count;
}
