import express from 'express';
import { db } from '../db.js';
import * as resumeService from '../services/resumeService.js';
import * as candidateService from '../services/candidateService.js';
import * as offerService from '../services/offerService.js';
import * as promotionService from '../services/promotionService.js';
import { uploadFile } from '../middleware/upload.js';

const router = express.Router();

// ============================================================================
// CANDIDATE CRUD ENDPOINTS
// ============================================================================

/**
 * GET /api/candidates
 * List candidates with filters, sorting, and pagination
 * Query params:
 *   - status: Filter by status (comma-separated for multiple)
 *   - stage: Filter by stage
 *   - sourceId: Filter by source ID
 *   - seniorityId: Filter by seniority ID
 *   - clientId: Filter by client ID
 *   - tags: Filter by skill tags (comma-separated IDs)
 *   - dateRangeFrom: Filter from date (YYYY-MM-DD)
 *   - dateRangeTo: Filter to date (YYYY-MM-DD)
 *   - sortBy: Sort column (default: createdAt)
 *   - sortOrder: asc or desc (default: desc)
 *   - limit: Pagination limit (default: 25, max: 100)
 *   - offset: Pagination offset (default: 0)
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      stage,
      sourceId,
      seniorityId,
      clientId,
      tags,
      dateRangeFrom,
      dateRangeTo,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    const result = await candidateService.listCandidates({
      status,
      stage,
      sourceId,
      seniorityId,
      clientId,
      tags,
      dateRangeFrom,
      dateRangeTo,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    res.json(result);
  } catch (error) {
    console.error('[GET /api/candidates]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/candidates
 * Create a new candidate with duplicate email detection
 * Body:
 *   - name (required)
 *   - email (required, unique)
 *   - roleApplied (required)
 *   - phone (optional)
 *   - location (optional)
 *   - status (optional, default: active)
 *   - stage (optional, default: applied)
 *   - sourceId (optional)
 *   - seniorityId (optional)
 *   - clientId (optional)
 *   - referredBy (optional)
 *   - notes (optional)
 *
 * Returns 409 conflict if email exists, with existingCandidate data
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      roleApplied,
      phone,
      location,
      status = 'active',
      stage = 'applied',
      sourceId,
      seniorityId,
      clientId,
      referredBy,
      notes,
    } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!email) return res.status(400).json({ error: 'email is required' });
    if (!roleApplied)
      return res.status(400).json({ error: 'roleApplied is required' });

    // Check for duplicate email
    const existing = await candidateService.checkDuplicateEmail(email);
    if (existing) {
      return res.status(409).json({
        conflict: true,
        existingCandidateId: existing.id,
        existingCandidate: existing,
        error: `Candidate with email ${email} already exists`,
      });
    }

    // Create candidate
    const candidate = await db.candidate.create({
      data: {
        name,
        email,
        roleApplied,
        phone: phone || null,
        location: location || null,
        status,
        stage,
        sourceId: sourceId || null,
        seniorityId: seniorityId || null,
        clientId: clientId || null,
        referredBy: referredBy || null,
        notes: notes || null,
      },
    });

    res.status(201).json(candidate);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/candidates/:id
 * Get candidate detail with related data (resumes, interviews, offers, tags)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await candidateService.getCandidateDetail(id);
    res.json(candidate);
  } catch (error) {
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    console.error('[GET /api/candidates/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/candidates/:id
 * Update candidate
 * Body can include: name, email, phone, location, roleApplied, status, stage,
 *   sourceId, seniorityId, clientId, referredBy, notes
 *
 * Stage progression rules (TASK 4.1):
 *   - Valid forward progression: applied → screening → interview → offer → closed
 *   - Can move to rejected from any stage
 *   - Cannot move backward (except to rejected)
 *   - Updates latestStageChangeAt when stage changes
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify candidate exists
    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Validate stage progression if stage is being updated
    if (updates.stage && updates.stage !== existing.stage) {
      const validStages = ['applied', 'screening', 'interview', 'offer', 'closed', 'rejected'];

      if (!validStages.includes(updates.stage)) {
        return res.status(400).json({
          error: `Invalid stage: ${updates.stage}. Valid stages are: ${validStages.join(', ')}`
        });
      }

      // Define stage progression order
      const stageOrder = {
        'applied': 0,
        'screening': 1,
        'interview': 2,
        'offer': 3,
        'closed': 4,
        'rejected': 999, // Can move to rejected from any stage
      };

      const currentStageOrder = stageOrder[existing.stage];
      const newStageOrder = stageOrder[updates.stage];

      // Allow forward progression, movement to rejected, or staying at same stage
      if (newStageOrder < currentStageOrder && updates.stage !== 'rejected') {
        return res.status(400).json({
          error: `Cannot move from ${existing.stage} to ${updates.stage}. Only forward progression or move to rejected is allowed.`
        });
      }

      // Update latestStageChangeAt when stage changes
      updates.latestStageChangeAt = new Date();
    }

    // Update latestStageChangeAt when status changes to rejected
    if (updates.status === 'rejected' && existing.status !== 'rejected') {
      updates.latestStageChangeAt = new Date();
    }

    // Try to update
    try {
      const updated = await db.candidate.update({
        where: { id },
        data: updates,
      });
      res.json(updated);
    } catch (dbError) {
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[PATCH /api/candidates/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/candidates/:id
 * Soft delete by setting status=rejected
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Soft delete: set status to rejected
    await db.candidate.update({
      where: { id },
      data: { status: 'rejected' },
    });

    res.status(204).send();
  } catch (error) {
    console.error('[DELETE /api/candidates/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// RESUME MANAGEMENT ENDPOINTS
// ============================================================================

// POST /api/candidates/:id/resumes - Upload a new resume version
router.post('/:id/resumes', uploadFile, async (req, res) => {
  try {
    const { id: candidateId } = req.params;

    // Verify file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Upload resume with versioning
    const resume = await resumeService.uploadResume(
      candidateId,
      req.file.buffer,
      req.file.originalname
    );

    res.status(201).json(resume);
  } catch (error) {
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/candidates/:id/resumes - List all resume versions for candidate
router.get('/:id/resumes', async (req, res) => {
  try {
    const { id: candidateId } = req.params;

    const resumes = await resumeService.listResumes(candidateId);

    res.json(resumes);
  } catch (error) {
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/candidates/:id/resumes/:resumeId - Set resume as active
router.patch('/:id/resumes/:resumeId', async (req, res) => {
  try {
    const { id: candidateId, resumeId } = req.params;
    const { isActive } = req.body;

    // Only handle isActive: true to activate a resume
    if (isActive !== true) {
      return res
        .status(400)
        .json({ error: 'Only isActive: true is supported' });
    }

    const resume = await resumeService.setActiveResume(candidateId, resumeId);

    res.json(resume);
  } catch (error) {
    if (
      error.message === 'Candidate not found' ||
      error.message === 'Resume not found'
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/candidates/:id/resumes/:resumeId - Delete a specific resume version
router.delete('/:id/resumes/:resumeId', async (req, res) => {
  try {
    const { id: candidateId, resumeId } = req.params;

    await resumeService.deleteResume(candidateId, resumeId);

    res.status(204).send();
  } catch (error) {
    if (
      error.message === 'Candidate not found' ||
      error.message === 'Resume not found'
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// OFFER MANAGEMENT ENDPOINTS (TASK 4.2)
// ============================================================================

/**
 * GET /api/candidates/:id/offers
 * List all offers for a candidate
 */
router.get('/:id/offers', async (req, res) => {
  try {
    const { id: candidateId } = req.params;

    const offers = await offerService.listOffers(candidateId);

    res.json(offers);
  } catch (error) {
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[GET /api/candidates/:id/offers]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TASK 4.3-4.4: PROMOTION & REJECTION ENDPOINTS
// ============================================================================

/**
 * POST /api/candidates/:id/promote
 * Promote candidate to employee
 * Creates Employee record, links Candidate, auto-applies company tracks,
 * creates OnboardingRuns and TaskInstances
 *
 * Body:
 *   - confirmDetails (required): { title, department, startDate }
 *   - selectedTrackIds (optional): Array of track template IDs to apply
 *
 * Returns: { employee, onboardingRuns }
 */
router.post('/:id/promote', async (req, res) => {
  try {
    const { id: candidateId } = req.params;
    const { confirmDetails, selectedTrackIds = [] } = req.body;

    // Validate required fields
    if (!confirmDetails) {
      return res.status(400).json({ error: 'confirmDetails is required' });
    }
    if (!confirmDetails.title) {
      return res.status(400).json({ error: 'confirmDetails.title is required' });
    }
    if (!confirmDetails.department) {
      return res.status(400).json({ error: 'confirmDetails.department is required' });
    }

    // Promote candidate
    const result = await promotionService.promoteCandidate(
      candidateId,
      confirmDetails,
      selectedTrackIds
    );

    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    if (error.message.includes('already promoted')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('[POST /api/candidates/:id/promote]', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
