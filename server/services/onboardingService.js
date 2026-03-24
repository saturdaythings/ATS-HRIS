import { db } from '../db.js';

/**
 * Onboarding Service
 * Handles CRUD operations for onboarding/offboarding runs and task instances
 */

// ============================================================================
// ONBOARDING RUN OPERATIONS
// ============================================================================

/**
 * Get all onboarding runs for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Array>} List of onboarding runs with task count and progress
 */
export async function getRuns(employeeId) {
  // Verify employee exists
  const employee = await db.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    const error = new Error('Employee not found');
    error.status = 404;
    throw error;
  }

  const runs = await db.onboardingRun.findMany({
    where: { employeeId },
    include: {
      track: true,
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate task count and progress for each run
  return runs.map(run => ({
    ...run,
    taskCount: run.tasks.length,
    progress: calculateProgress(run.tasks),
  }));
}

/**
 * Get onboarding run detail with tasks
 * @param {string} runId - Run ID
 * @returns {Promise<Object>} Run details with task instances and progress
 */
export async function getRun(runId) {
  const run = await db.onboardingRun.findUnique({
    where: { id: runId },
    include: {
      employee: true,
      track: true,
      tasks: {
        include: {
          taskTemplate: true,
        },
        orderBy: {
          taskTemplate: { order: 'asc' },
        },
      },
    },
  });

  if (!run) {
    const error = new Error('OnboardingRun not found');
    error.status = 404;
    throw error;
  }

  return {
    ...run,
    progress: calculateProgress(run.tasks),
  };
}

/**
 * Update onboarding run status
 * @param {string} runId - Run ID
 * @param {Object} data - Update data (status, startDate, etc.)
 * @returns {Promise<Object>} Updated run
 */
export async function updateRunStatus(runId, data) {
  // Verify run exists
  const existing = await db.onboardingRun.findUnique({ where: { id: runId } });
  if (!existing) {
    const error = new Error('OnboardingRun not found');
    error.status = 404;
    throw error;
  }

  // Validate status if provided
  if (data.status) {
    const validStatuses = ['pending', 'in_progress', 'complete'];
    if (!validStatuses.includes(data.status)) {
      const error = new Error(`Invalid status: ${data.status}. Must be one of: ${validStatuses.join(', ')}`);
      error.status = 400;
      throw error;
    }
  }

  // Build update object
  const updateData = {};
  for (const key of Object.keys(data)) {
    if (key === 'startDate') {
      updateData[key] = data[key] ? new Date(data[key]) : null;
    } else {
      updateData[key] = data[key];
    }
  }

  const updated = await db.onboardingRun.update({
    where: { id: runId },
    data: updateData,
    include: {
      employee: true,
      track: true,
      tasks: true,
    },
  });

  return {
    ...updated,
    progress: calculateProgress(updated.tasks),
  };
}

// ============================================================================
// TASK INSTANCE OPERATIONS
// ============================================================================

/**
 * Update task instance
 * @param {string} runId - Run ID
 * @param {string} taskId - Task instance ID
 * @param {Object} data - Update data (status, completedAt, notes, assignedTo)
 * @returns {Promise<Object>} Updated task instance
 */
export async function updateTaskInstance(runId, taskId, data) {
  // Verify run exists
  const run = await db.onboardingRun.findUnique({ where: { id: runId } });
  if (!run) {
    const error = new Error('OnboardingRun not found');
    error.status = 404;
    throw error;
  }

  // Verify task instance exists and belongs to this run
  const task = await db.taskInstance.findUnique({
    where: { id: taskId },
    include: { taskTemplate: true },
  });

  if (!task || task.runId !== runId) {
    const error = new Error('TaskInstance not found');
    error.status = 404;
    throw error;
  }

  // Validate status if provided
  if (data.status) {
    const validStatuses = ['pending', 'in_progress', 'complete', 'skipped'];
    if (!validStatuses.includes(data.status)) {
      const error = new Error(`Invalid status: ${data.status}. Must be one of: ${validStatuses.join(', ')}`);
      error.status = 400;
      throw error;
    }
  }

  // Build update object
  const updateData = {};
  for (const key of Object.keys(data)) {
    if (key === 'completedAt') {
      updateData[key] = data[key] ? new Date(data[key]) : null;
    } else {
      updateData[key] = data[key];
    }
  }

  // Auto-set completedAt when marking as complete
  if (data.status === 'complete' && !updateData.completedAt) {
    updateData.completedAt = new Date();
  }

  const updated = await db.taskInstance.update({
    where: { id: taskId },
    data: updateData,
    include: {
      taskTemplate: true,
    },
  });

  return updated;
}

/**
 * Get task instances for a run
 * @param {string} runId - Run ID
 * @returns {Promise<Array>} Task instances
 */
export async function getTaskInstances(runId) {
  const run = await db.onboardingRun.findUnique({ where: { id: runId } });
  if (!run) {
    const error = new Error('OnboardingRun not found');
    error.status = 404;
    throw error;
  }

  const tasks = await db.taskInstance.findMany({
    where: { runId },
    include: {
      taskTemplate: true,
    },
    orderBy: {
      taskTemplate: { order: 'asc' },
    },
  });

  return tasks;
}

// ============================================================================
// DASHBOARD OPERATIONS
// ============================================================================

/**
 * Get pending tasks due in next 7 days, grouped by employee
 * @returns {Promise<Array>} Tasks grouped by employee
 */
export async function getPendingTasksNextSevenDays() {
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const tasks = await db.taskInstance.findMany({
    where: {
      dueDate: {
        gte: today,
        lte: sevenDaysFromNow,
      },
      status: {
        in: ['pending', 'in_progress'],
      },
    },
    include: {
      run: {
        include: { employee: true },
      },
      taskTemplate: true,
    },
    orderBy: [{ dueDate: 'asc' }],
  });

  // Group by employee
  const groupedByEmployee = {};
  tasks.forEach(task => {
    const employeeId = task.run.employee.id;
    if (!groupedByEmployee[employeeId]) {
      groupedByEmployee[employeeId] = {
        employeeId,
        employee: task.run.employee,
        tasks: [],
      };
    }
    groupedByEmployee[employeeId].tasks.push(task);
  });

  return Object.values(groupedByEmployee);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate progress percentage
 * Progress = (complete tasks + skipped tasks) / total tasks * 100
 * @param {Array} tasks - Array of task instances
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(tasks) {
  if (tasks.length === 0) {
    return 0;
  }

  const completedOrSkipped = tasks.filter(
    task => task.status === 'complete' || task.status === 'skipped'
  ).length;

  return Math.round((completedOrSkipped / tasks.length) * 100);
}

/**
 * Calculate due date from startDate and dueDaysOffset
 * @param {Date} startDate - Run start date
 * @param {number} dueDaysOffset - Offset in days (can be negative)
 * @returns {Date|null} Calculated due date or null if dueDaysOffset is null
 */
export function calculateDueDate(startDate, dueDaysOffset) {
  if (!startDate || dueDaysOffset === null || dueDaysOffset === undefined) {
    return null;
  }

  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + dueDaysOffset);
  return dueDate;
}
