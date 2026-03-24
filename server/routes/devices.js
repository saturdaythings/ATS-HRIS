import express from 'express';
import { db } from '../db.js';
import {
  assignDevice,
  returnDevice,
  getAssignmentHistory,
  getEmployeeDevices,
  listDevices,
  getDeviceWithAssignment,
  createDevice,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from '../services/deviceService.js';

const router = express.Router();

// ==================== SPECIAL ROUTES (must come before /:id) ====================

// GET /api/devices/pool/unassigned - Get unassigned devices
router.get('/pool/unassigned', async (req, res, next) => {
  try {
    const devices = await listDevices({
      status: 'available',
    });
    res.json(devices);
  } catch (error) {
    next(error);
  }
});

// ==================== TASK 7.3: BASIC CRUD ENDPOINTS ====================

// GET /api/devices - List all devices with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { type, status, condition, limit = 25, offset = 0 } = req.query;
    const devices = await listDevices({
      type,
      status,
      condition,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(devices);
  } catch (error) {
    next(error);
  }
});

// POST /api/devices - Create a new device
router.post('/', async (req, res, next) => {
  try {
    const { serial, type, make, model, condition, status, warrantyExp, notes } = req.body;

    // Validate required fields
    if (!serial || !type || !make || !model) {
      return res.status(400).json({
        error: 'serial, type, make, and model are required'
      });
    }

    const device = await createDevice({
      serial,
      type,
      make,
      model,
      condition,
      status,
      warrantyExp: warrantyExp ? new Date(warrantyExp) : null,
      notes,
    });

    res.status(201).json(device);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Serial number must be unique' });
    }
    next(error);
  }
});

// ==================== TASK 7.4: ASSIGNMENT ENDPOINTS (before /:id routes) ====================

/**
 * POST /api/devices/:id/assign
 * Assign a device to an employee
 * Body: { employeeId, assignedDate?, notes? }
 */
router.post('/:id/assign', async (req, res, next) => {
  try {
    const { id: deviceId } = req.params;
    const { employeeId, assignedDate, notes } = req.body;

    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const assignment = await assignDevice({
      deviceId,
      employeeId,
      assignedDate: assignedDate ? new Date(assignedDate) : undefined,
      notes,
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('already assigned')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/devices/:id/return
 * Return a device from an employee
 * Body: { returnedDate, condition?, notes? }
 */
router.patch('/:id/return', async (req, res, next) => {
  try {
    const { id: deviceId } = req.params;
    const { returnedDate, condition, notes } = req.body;

    // Validate required fields
    if (!returnedDate) {
      return res.status(400).json({ error: 'returnedDate is required' });
    }

    const updated = await returnDevice({
      deviceId,
      returnedDate: new Date(returnedDate),
      condition,
      notes,
    });

    res.json(updated);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('no active assignment')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/devices/:id/history
 * Get assignment history for a device
 */
router.get('/:id/history', async (req, res, next) => {
  try {
    const { id: deviceId } = req.params;
    const history = await getAssignmentHistory(deviceId);
    res.json(history);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// ==================== DYNAMIC :id ROUTES (must come after specific routes) ====================

// GET /api/devices/:id - Get device details with assignment history
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await getDeviceById(id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/devices/:id - Update device (condition, warranty, status, notes)
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await updateDevice(id, {
      condition: req.body.condition,
      status: req.body.status,
      notes: req.body.notes,
      warrantyExp: req.body.warrantyExp ? new Date(req.body.warrantyExp) : undefined,
    });

    res.json(updated);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Device not found' });
    }
    next(error);
  }
});

// DELETE /api/devices/:id - Soft delete (retire) device
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await deleteDevice(id);
    res.json(updated);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Device not found' });
    }
    next(error);
  }
});

export default router;
