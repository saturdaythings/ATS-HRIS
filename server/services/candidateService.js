import { db } from '../db.js';
import * as resumeUploadService from './resumeUploadService.js';

/**
 * Candidate Service
 * Handles CRUD operations for candidates with resume integration
 */

/**
 * Create a new candidate
 * @param {Object} data - Candidate data
 * @returns {Promise<Object>} Created candidate
 */
export async function createCandidate(data) {
  const { name, email, role, status = 'active', stage = 'sourced', resumeUrl, notes } = data;

  // Validate required fields
  if (!name) throw new Error('Candidate name is required');
  if (!email) throw new Error('Candidate email is required');
  if (!role) throw new Error('Candidate role is required');

  // Create candidate
  const candidate = await db.candidate.create({
    data: {
      name,
      email,
      role,
      status,
      stage,
      resumeUrl: resumeUrl || null,
      notes: notes || null,
    },
  });

  return candidate;
}

/**
 * Get candidate by ID
 * @param {string} id - Candidate ID
 * @returns {Promise<Object>} Candidate
 */
export async function getCandidateById(id) {
  const candidate = await db.candidate.findUnique({
    where: { id },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  return candidate;
}

/**
 * Update candidate
 * @param {string} id - Candidate ID
 * @param {Object} data - Update data (status, stage, notes, resumeUrl)
 * @returns {Promise<Object>} Updated candidate
 */
export async function updateCandidate(id, data) {
  // Verify candidate exists
  const existing = await db.candidate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Candidate not found');
  }

  // Update candidate
  const updated = await db.candidate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.stage !== undefined && { stage: data.stage }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.resumeUrl !== undefined && { resumeUrl: data.resumeUrl }),
    },
  });

  return updated;
}

/**
 * Delete candidate (soft or hard delete)
 * @param {string} id - Candidate ID
 * @returns {Promise<void>}
 */
export async function deleteCandidate(id) {
  // Verify candidate exists
  const existing = await db.candidate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Candidate not found');
  }

  // Delete candidate
  await db.candidate.delete({
    where: { id },
  });
}

/**
 * List all candidates with optional filters
 * @param {Object} filters - Filter options (status, stage)
 * @returns {Promise<Array>} List of candidates
 */
export async function listCandidates(filters = {}) {
  const { status, stage } = filters;

  const candidates = await db.candidate.findMany({
    where: {
      ...(status !== undefined && { status }),
      ...(stage !== undefined && { stage }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return candidates;
}

/**
 * Associate resume with existing candidate
 * Uploads resume file and stores URL in candidate record
 * @param {string} candidateId - Candidate ID
 * @param {Buffer} fileBuffer - File buffer content
 * @param {string} fileName - Original file name
 * @returns {Promise<Object>} Updated candidate with resume URL
 */
export async function associateResumeWithCandidate(
  candidateId,
  fileBuffer,
  fileName
) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Upload resume file
  const { url } = await resumeUploadService.saveResumeFile(fileBuffer, fileName);

  // Update candidate with resume URL
  const updated = await db.candidate.update({
    where: { id: candidateId },
    data: {
      resumeUrl: url,
    },
  });

  return updated;
}

/**
 * Get candidate with resume data
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Object>} Candidate with resume URL
 */
export async function getCandidateWithResume(candidateId) {
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  return candidate;
}

/**
 * Update candidate resume (replace with new file)
 * @param {string} candidateId - Candidate ID
 * @param {Buffer} fileBuffer - New file buffer content
 * @param {string} fileName - New file name
 * @returns {Promise<Object>} Updated candidate with new resume URL
 */
export async function updateCandidateResume(candidateId, fileBuffer, fileName) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Upload new resume file
  const { url } = await resumeUploadService.saveResumeFile(fileBuffer, fileName);

  // Update candidate with new resume URL
  const updated = await db.candidate.update({
    where: { id: candidateId },
    data: {
      resumeUrl: url,
    },
  });

  return updated;
}

/**
 * Delete candidate resume (clear resume URL)
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Object>} Updated candidate with cleared resume
 */
export async function deleteCandidateResume(candidateId) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Clear resume URL
  const updated = await db.candidate.update({
    where: { id: candidateId },
    data: {
      resumeUrl: null,
    },
  });

  return updated;
}

/**
 * List candidates with resume filtering
 * @param {Object} filters - Filter options (hasResume, status, stage)
 * @returns {Promise<Array>} List of candidates
 */
export async function listCandidatesWithResumes(filters = {}) {
  const { hasResume, status, stage } = filters;

  let whereClause = {};

  // Filter by resume status
  if (hasResume === true) {
    whereClause.resumeUrl = {
      not: null,
    };
  } else if (hasResume === false) {
    whereClause.resumeUrl = null;
  }

  // Add other filters
  if (status !== undefined) {
    whereClause.status = status;
  }

  if (stage !== undefined) {
    whereClause.stage = stage;
  }

  const candidates = await db.candidate.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return candidates;
}
