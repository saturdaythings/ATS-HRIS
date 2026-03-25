import express from 'express';
import {
  getRuns,
  getRun,
  updateRunStatus,
  updateTaskInstance,
  getTaskInstances,
  getPendingTasksNextSevenDays,
} from '../services/onboardingService.js';

// Template data store (in-memory for Phase 5)
const templates = [
  {
    id: '1',
    name: 'Standard Onboarding',
    role: 'employee',
    items: [
      { id: '1-1', task: 'IT Setup', dueDay: 1, assignee: 'it-team' },
      { id: '1-2', task: 'Orientation', dueDay: 1, assignee: 'hr' },
      { id: '1-3', task: 'Manager 1-on-1', dueDay: 3, assignee: 'manager' },
      { id: '1-4', task: '30-day Review', dueDay: 30, assignee: 'manager' },
    ],
    createdAt: new Date('2026-01-01'),
  },
];

const router = express.Router();

/**
 * GET /api/onboarding
 * Get all onboarding runs with their tasks and employee names
 */
router.get('/', async (req, res, next) => {
  try {
    const runs = await getRuns();
    res.json({ data: runs, error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/onboarding/templates
 * Get all onboarding templates, optionally filtered by role
 */
router.get('/templates', async (req, res, next) => {
  try {
    const { role } = req.query;
    let filtered = templates;

    if (role) {
      filtered = templates.filter(t => t.role === role);
    }

    res.json({ data: filtered, error: null });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// TASK 6.1: ONBOARDING RUN ENDPOINTS
// ============================================================================

/**
 * GET /api/employees/:employeeId/onboarding-runs
 * List all onboarding/offboarding runs for an employee
 */
router.get('/employees/:employeeId/onboarding-runs', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const runs = await getRuns(employeeId);
    res.json({ data: runs, error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/onboarding-runs/:runId
 * Get onboarding run detail with tasks and progress
 */
router.get('/onboarding-runs/:runId', async (req, res, next) => {
  try {
    const { runId } = req.params;
    const run = await getRun(runId);
    res.json({ data: run, error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/onboarding-runs/:runId
 * Update onboarding run status
 */
router.patch('/onboarding-runs/:runId', async (req, res, next) => {
  try {
    const { runId } = req.params;
    const data = req.body;
    const updated = await updateRunStatus(runId, data);
    res.json({ data: updated, error: null });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// TASK 6.2: TASK INSTANCE ENDPOINTS
// ============================================================================

/**
 * PATCH /api/onboarding-runs/:runId/tasks/:taskId
 * Update task instance (status, completedAt, notes, assignedTo)
 */
router.patch('/onboarding-runs/:runId/tasks/:taskId', async (req, res, next) => {
  try {
    const { runId, taskId } = req.params;
    const data = req.body;
    const updated = await updateTaskInstance(runId, taskId, data);
    res.json({ data: updated, error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/onboarding-runs/:runId/tasks
 * List all task instances for a run
 */
router.get('/onboarding-runs/:runId/tasks', async (req, res, next) => {
  try {
    const { runId } = req.params;
    const tasks = await getTaskInstances(runId);
    res.json({ data: tasks, error: null });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboard/pending-tasks
 * Get tasks due in next 7 days, grouped by employee
 */
router.get('/dashboard/pending-tasks', async (req, res, next) => {
  try {
    const tasks = await getPendingTasksNextSevenDays();
    res.json({ data: tasks, error: null });
  } catch (error) {
    next(error);
  }
});

export default router;
