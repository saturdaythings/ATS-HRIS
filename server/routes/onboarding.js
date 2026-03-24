import express from 'express';
import {
  getRuns,
  getRun,
  updateRunStatus,
  updateTaskInstance,
  getTaskInstances,
  getPendingTasksNextSevenDays,
} from '../services/onboardingService.js';

const router = express.Router();

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
