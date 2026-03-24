import express from 'express';
import * as offerService from '../services/offerService.js';

const router = express.Router();

/**
 * POST /api/offers
 * Create a new offer
 * Body:
 *   - candidateId (required)
 *   - role (required)
 *   - compensation (optional)
 *   - startDate (optional)
 *   - sentAt (optional)
 *   - expiresAt (optional)
 *   - notes (optional)
 */
router.post('/', async (req, res) => {
  try {
    const {
      candidateId,
      role,
      compensation,
      startDate,
      sentAt,
      expiresAt,
      notes,
    } = req.body;

    const offer = await offerService.createOffer({
      candidateId,
      role,
      compensation,
      startDate,
      sentAt,
      expiresAt,
      notes,
    });

    res.status(201).json(offer);
  } catch (error) {
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('is required')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('[POST /api/offers]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/offers/:id
 * Get offer details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await offerService.getOffer(id);
    res.json(offer);
  } catch (error) {
    if (error.message === 'Offer not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[GET /api/offers/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/offers/:id
 * Update offer
 * Body can include: status, compensation, startDate, sentAt, expiresAt, role, notes
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const offer = await offerService.updateOffer(id, updates);
    res.json(offer);
  } catch (error) {
    if (error.message === 'Offer not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[PATCH /api/offers/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/offers
 * List all offers with optional filters
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Implement offer listing with filters (status, candidate)
    res.json({ message: 'GET /api/offers - List offers (Phase 2)' });
  } catch (error) {
    console.error('[GET /api/offers]', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
