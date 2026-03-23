import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/candidates - List all candidates
router.get('/', async (req, res) => {
  // TODO: Implement listing with filters (status, stage)
  res.json({ message: 'GET /api/candidates - List candidates (Phase 2)' });
});

// POST /api/candidates - Create a new candidate
router.post('/', async (req, res) => {
  // TODO: Implement candidate creation
  res.status(201).json({ message: 'POST /api/candidates - Create candidate (Phase 2)' });
});

// GET /api/candidates/:id - Get candidate details
router.get('/:id', async (req, res) => {
  // TODO: Implement candidate retrieval
  res.json({ message: 'GET /api/candidates/:id - Get candidate (Phase 2)' });
});

// PATCH /api/candidates/:id - Update candidate
router.patch('/:id', async (req, res) => {
  // TODO: Implement candidate update (stage, status, notes)
  res.json({ message: 'PATCH /api/candidates/:id - Update candidate (Phase 2)' });
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req, res) => {
  // TODO: Implement candidate deletion
  res.status(204).send();
});

export default router;
