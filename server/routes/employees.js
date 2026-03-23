import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/employees - List all employees (directory)
router.get('/', async (req, res) => {
  // TODO: Implement listing with filters (department, status)
  res.json({ message: 'GET /api/employees - List employees (Phase 2)' });
});

// POST /api/employees - Create a new employee (promote from candidate)
router.post('/', async (req, res) => {
  // TODO: Implement employee creation from candidate
  res.status(201).json({ message: 'POST /api/employees - Create employee (Phase 2)' });
});

// GET /api/employees/:id - Get employee details
router.get('/:id', async (req, res) => {
  // TODO: Implement employee retrieval with onboarding/device assignments
  res.json({ message: 'GET /api/employees/:id - Get employee (Phase 2)' });
});

// PATCH /api/employees/:id - Update employee
router.patch('/:id', async (req, res) => {
  // TODO: Implement employee update (title, department, status)
  res.json({ message: 'PATCH /api/employees/:id - Update employee (Phase 2)' });
});

// DELETE /api/employees/:id - Offboard employee
router.delete('/:id', async (req, res) => {
  // TODO: Implement employee offboarding
  res.status(204).send();
});

// GET /api/employees/:id/onboarding - Get onboarding tasks
router.get('/:id/onboarding', async (req, res) => {
  // TODO: Implement onboarding task retrieval
  res.json({ message: 'GET /api/employees/:id/onboarding - Get tasks (Phase 4)' });
});

// GET /api/employees/:id/offboarding - Get offboarding tasks
router.get('/:id/offboarding', async (req, res) => {
  // TODO: Implement offboarding task retrieval
  res.json({ message: 'GET /api/employees/:id/offboarding - Get tasks (Phase 4)' });
});

export default router;
