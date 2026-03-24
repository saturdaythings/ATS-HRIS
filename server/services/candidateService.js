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
 * List all candidates with optional filters, sorting, and pagination
 * @param {Object} options - Filter, sort, and pagination options
 * @param {string} options.status - Filter by status (comma-separated for multiple)
 * @param {string} options.stage - Filter by stage
 * @param {string} options.sourceId - Filter by source ID
 * @param {string} options.seniorityId - Filter by seniority ID
 * @param {string} options.clientId - Filter by client ID
 * @param {string} options.tags - Filter by skill tags (comma-separated IDs)
 * @param {string} options.dateRangeFrom - Filter by sourcedAt from date (YYYY-MM-DD)
 * @param {string} options.dateRangeTo - Filter by sourcedAt to date (YYYY-MM-DD)
 * @param {string} options.sortBy - Sort by column (default: createdAt)
 * @param {string} options.sortOrder - Sort order (asc or desc, default: desc)
 * @param {number} options.limit - Pagination limit (default: 25)
 * @param {number} options.offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} { candidates: [], total, page, limit }
 */
export async function listCandidates(options = {}) {
  const {
    status,
    stage,
    sourceId,
    seniorityId,
    clientId,
    tags,
    dateRangeFrom,
    dateRangeTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 25,
    offset = 0,
  } = options;

  // Build where clause
  const where = {};

  // Status filter (support comma-separated values)
  if (status) {
    const statusValues = status.split(',').map(s => s.trim());
    if (statusValues.length === 1) {
      where.status = statusValues[0];
    } else {
      where.status = { in: statusValues };
    }
  }

  if (stage) {
    where.stage = stage;
  }

  if (sourceId) {
    where.sourceId = sourceId;
  }

  if (seniorityId) {
    where.seniorityId = seniorityId;
  }

  if (clientId) {
    where.clientId = clientId;
  }

  // Date range filter
  if (dateRangeFrom || dateRangeTo) {
    where.sourcedAt = {};
    if (dateRangeFrom) {
      where.sourcedAt.gte = new Date(`${dateRangeFrom}T00:00:00Z`);
    }
    if (dateRangeTo) {
      where.sourcedAt.lte = new Date(`${dateRangeTo}T23:59:59Z`);
    }
  }

  // Tags filter (requires joining candidateSkillTag)
  let candidates;
  const parsedLimit = Math.min(parseInt(limit, 10) || 25, 100);
  const parsedOffset = parseInt(offset, 10) || 0;

  if (tags) {
    // Filter by tags using findMany with nested relation query
    const tagIds = tags.split(',').map(t => t.trim());
    candidates = await db.candidate.findMany({
      where: {
        ...where,
        skillTags: {
          some: {
            tagId: {
              in: tagIds,
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(),
      },
      skip: parsedOffset,
      take: parsedLimit,
    });
  } else {
    candidates = await db.candidate.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(),
      },
      skip: parsedOffset,
      take: parsedLimit,
    });
  }

  // Get total count for pagination
  const total = await db.candidate.count({ where });
  const page = Math.floor(parsedOffset / parsedLimit) + 1;

  return {
    candidates,
    total,
    page,
    limit: parsedLimit,
  };
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

/**
 * Check if candidate email already exists
 * @param {string} email - Candidate email
 * @returns {Promise<Object|null>} Existing candidate data or null
 */
export async function checkDuplicateEmail(email) {
  return db.candidate.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      roleApplied: true,
      status: true,
      stage: true,
    },
  });
}

/**
 * Get candidate with full related data (resumes, interviews, offers, tags)
 * @param {string} id - Candidate ID
 * @returns {Promise<Object>} Candidate with relations
 */
export async function getCandidateDetail(id) {
  const candidate = await db.candidate.findUnique({
    where: { id },
    include: {
      resumes: {
        orderBy: { uploadedAt: 'desc' },
      },
      interviews: {
        include: {
          interviewers: true,
        },
        orderBy: { scheduledAt: 'desc' },
      },
      offers: {
        orderBy: { createdAt: 'desc' },
      },
      skillTags: {
        include: {
          tag: true,
        },
      },
      source: true,
      seniority: true,
      client: true,
      rejectionReason: true,
    },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  return candidate;
}
