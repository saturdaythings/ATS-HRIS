import express from 'express';
import { db } from '../db.js';
import { getEmployeeDevices } from '../services/deviceService.js';
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService.js';

const router = express.Router();

// GET /api/employees - List all employees with filters and pagination
router.get('/', async (req, res, next) => {
  try {
    const { department, status, limit = 25, offset = 0, sortBy } = req.query;

    const result = await listEmployees({
      department,
      status,
      sortBy,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/employees - Create a new employee
router.post('/', async (req, res, next) => {
  try {
    const { name, email, title, department, startDate, clientId, candidateId } = req.body;

    if (!name || !email || !title) {
      return res.status(400).json({
        error: 'name, email, and title are required'
      });
    }

    const employee = await createEmployee({
      name,
      email,
      title,
      department,
      startDate: startDate ? new Date(startDate) : null,
      clientId,
      candidateId,
    });

    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// GET /api/employees/:id - Get employee details
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await getEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/employees/:id - Update employee
router.patch('/:id', async (req, res, next) => {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    res.json(employee);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    next(error);
  }
});

// DELETE /api/employees/:id - Soft delete (offboard) employee
router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await deleteEmployee(req.params.id);
    res.json(employee);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    next(error);
  }
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

// GET /api/employees/:id/devices - Get all devices assigned to employee (TASK 7.4)
router.get('/:id/devices', async (req, res, next) => {
  try {
    const { id: employeeId } = req.params;
    const devices = await getEmployeeDevices(employeeId);
    res.json(devices);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
