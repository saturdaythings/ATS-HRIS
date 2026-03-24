import { db } from '../db.js';

/**
 * Promotion Service
 * Handles candidate-to-employee promotion and onboarding setup
 */

/**
 * Promote a candidate to employee status
 * Creates Employee record, auto-applies company tracks, creates onboarding runs
 *
 * @param {string} candidateId - Candidate ID to promote
 * @param {Object} confirmDetails - Employee confirmation details
 * @param {string} confirmDetails.title - Job title
 * @param {string} confirmDetails.department - Department
 * @param {string} [confirmDetails.startDate] - Start date
 * @param {string[]} selectedTrackIds - Array of track template IDs to apply
 * @returns {Promise<Object>} { employee, onboardingRuns }
 */
export async function promoteCandidate(candidateId, confirmDetails, selectedTrackIds = []) {
  // Validate candidate exists
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Check if already promoted (employee exists for this candidate)
  const existingEmployee = await db.employee.findUnique({
    where: { candidateId },
  });
  if (existingEmployee) {
    throw new Error('Candidate already promoted to employee');
  }

  // Validate confirmDetails
  if (!confirmDetails.title) {
    throw new Error('title is required in confirmDetails');
  }
  if (!confirmDetails.department) {
    throw new Error('department is required in confirmDetails');
  }

  // Create employee from candidate
  const employee = await db.employee.create({
    data: {
      name: candidate.name,
      email: candidate.email,
      title: confirmDetails.title,
      department: confirmDetails.department,
      startDate: confirmDetails.startDate ? new Date(confirmDetails.startDate) : null,
      status: 'active',
      candidateId: candidateId,
    },
  });

  // Update candidate status to hired
  await db.candidate.update({
    where: { id: candidateId },
    data: { status: 'hired' },
  });

  // Create onboarding runs for selected tracks
  const onboardingRuns = await createOnboardingRuns(
    employee.id,
    selectedTrackIds,
    confirmDetails.startDate ? new Date(confirmDetails.startDate) : new Date()
  );

  return {
    employee,
    onboardingRuns,
  };
}

/**
 * Create onboarding runs and task instances for an employee
 *
 * @param {string} employeeId - Employee ID
 * @param {string[]} trackIds - Array of track template IDs
 * @param {Date} startDate - Employee start date (for calculating task due dates)
 * @returns {Promise<Array>} Array of created OnboardingRun objects with tasks
 */
export async function createOnboardingRuns(employeeId, trackIds = [], startDate = new Date()) {
  const runs = [];

  for (const trackId of trackIds) {
    // Verify track exists
    const track = await db.trackTemplate.findUnique({
      where: { id: trackId },
      include: { tasks: { orderBy: { order: 'asc' } } },
    });

    if (!track) {
      console.warn(`Track ${trackId} not found, skipping`);
      continue;
    }

    // Create onboarding run
    const run = await db.onboardingRun.create({
      data: {
        employeeId,
        trackId,
        type: 'onboarding',
        status: 'pending',
        startDate,
      },
    });

    // Create task instances from track's task templates
    const tasks = [];
    for (const taskTemplate of track.tasks) {
      // Calculate due date
      let dueDate = null;
      if (taskTemplate.dueDaysOffset !== null) {
        const dueTime = new Date(startDate);
        dueTime.setDate(dueTime.getDate() + taskTemplate.dueDaysOffset);
        dueDate = dueTime;
      }

      // Create task instance
      const taskInstance = await db.taskInstance.create({
        data: {
          runId: run.id,
          taskTemplateId: taskTemplate.id,
          assignedTo: taskTemplate.ownerRole,
          dueDate,
          status: 'pending',
        },
      });

      tasks.push(taskInstance);
    }

    // Return run with tasks populated
    runs.push({
      ...run,
      tasks,
    });
  }

  return runs;
}

/**
 * Get auto-apply tracks (company type with autoApply=true)
 *
 * @returns {Promise<Array>} Array of auto-apply TrackTemplate objects
 */
export async function getAutoApplyTracks() {
  return db.trackTemplate.findMany({
    where: {
      type: 'company',
      autoApply: true,
    },
  });
}

/**
 * Get suggested tracks for a candidate (role or client tracks)
 *
 * @param {string} candidateRole - Candidate's applied role
 * @param {string} [clientId] - Optional client ID
 * @returns {Promise<Object>} { roleTracks, clientTracks }
 */
export async function getSuggestedTracks(candidateRole, clientId = null) {
  const roleTracks = await db.trackTemplate.findMany({
    where: {
      type: 'role',
      name: { contains: candidateRole, mode: 'insensitive' },
    },
  });

  let clientTracks = [];
  if (clientId) {
    clientTracks = await db.trackTemplate.findMany({
      where: {
        type: 'client',
        clientId,
      },
    });
  }

  return { roleTracks, clientTracks };
}
