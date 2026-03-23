import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/assignments - List all assignments
router.get('/', async (req, res) => {
  // TODO: Implement assignment listing with filters (active, returned)
  res.json({ message: 'GET /api/assignments - List assignments (Phase 3)' });
});

// POST /api/assignments - Create a new assignment (assign device to employee)
router.post('/', async (req, res) => {
  // TODO: Implement device assignment
  res.status(201).json({ message: 'POST /api/assignments - Create assignment (Phase 3)' });
});

// GET /api/assignments/:id - Get assignment details
router.get('/:id', async (req, res) => {
  // TODO: Implement assignment retrieval
  res.json({ message: 'GET /api/assignments/:id - Get assignment (Phase 3)' });
});

// PATCH /api/assignments/:id - Update assignment (return device)
router.patch('/:id', async (req, res) => {
  // TODO: Implement assignment return (set returnedDate)
  res.json({ message: 'PATCH /api/assignments/:id - Return device (Phase 3)' });
});

// GET /api/assignments/employee/:employeeId - Get devices for an employee
router.get('/employee/:employeeId', async (req, res) => {
  // TODO: Implement retrieval of active assignments for employee
  res.json({ message: 'GET /api/assignments/employee/:employeeId - Get employee devices (Phase 3)' });
});

// GET /api/assignments/device/:deviceId - Get assignment history for a device
router.get('/device/:deviceId', async (req, res) => {
  // TODO: Implement retrieval of assignment history for device
  res.json({ message: 'GET /api/assignments/device/:deviceId - Get device history (Phase 3)' });
});

export default router;
