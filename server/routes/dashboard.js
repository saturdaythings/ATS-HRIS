import express from 'express';
import {
  getMetrics,
  getActivityFeed,
  logActivity,
  getCandidateStageWidget,
  getOnboardingProgressWidget,
  getDeviceInventoryWidget,
  getTeamActivityWidget,
} from '../services/dashboardService.js';

const router = express.Router();

// GET /api/dashboard - Get dashboard overview with all metrics
router.get('/', async (req, res, next) => {
  try {
    // Get all the dashboard data
    const [
      activeCandidates,
      interviewsThisWeek,
      onboardingsInProgress,
      unassignedDevices,
      staleCandidates,
      upcomingInterviews,
      pendingOnboardingTasks,
      activityRecords,
    ] = await Promise.all([
      // Active candidates count
      getMetrics().then(m => m.candidatesInPipeline || 0),
      // Interviews scheduled this week
      getInterviewsThisWeek(),
      // Onboardings in progress
      getOnboardingsInProgress(),
      // Unassigned device count
      getUnassignedDevices(),
      // Stale candidates (active, no activity in 14+ days)
      getstaleCandidates(),
      // Upcoming interviews next 7 days
      getUpcomingInterviews(),
      // Pending onboarding tasks due next 7 days
      getPendingOnboardingTasks(),
      // Last 20 activity records
      getActivityFeed({ limit: 20, offset: 0 }),
    ]);

    res.json({
      data: {
        activeCandidateCount: activeCandidates,
        interviewsScheduledThisWeek: interviewsThisWeek,
        onboardingsInProgress,
        unassignedDeviceCount: unassignedDevices,
        staleCandidates,
        upcomingInterviewsNext7Days: upcomingInterviews,
        pendingOnboardingTasksNext7Days: pendingOnboardingTasks,
        lastActivityRecords: activityRecords.data || [],
      },
      message: 'Dashboard overview retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions for dashboard overview
async function getInterviewsThisWeek() {
  const db = (await import('../db.js')).db;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const interviews = await db.interview.count({
    where: {
      scheduledAt: { gte: weekStart, lte: weekEnd },
      status: 'scheduled',
    },
  });
  return interviews;
}

async function getOnboardingsInProgress() {
  const db = (await import('../db.js')).db;
  const count = await db.onboardingRun.count({
    where: { status: 'in_progress' },
  });
  return count;
}

async function getUnassignedDevices() {
  const db = (await import('../db.js')).db;
  const count = await db.device.count({
    where: { status: 'available' },
  });
  return count;
}

async function gettaleCandidates() {
  const db = (await import('../db.js')).db;
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const stale = await db.candidate.findMany({
    where: {
      status: 'active',
      latestStageChangeAt: { lte: fourteenDaysAgo },
    },
    select: { id: true, name: true, email: true, latestStageChangeAt: true },
  });
  return stale;
}

async function getUpcomingInterviews() {
  const db = (await import('../db.js')).db;
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const interviews = await db.interview.findMany({
    where: {
      scheduledAt: { gte: now, lte: sevenDaysFromNow },
      status: 'scheduled',
    },
    include: { candidate: { select: { name: true, email: true } } },
    orderBy: { scheduledAt: 'asc' },
  });
  return interviews;
}

async function getPendingOnboardingTasks() {
  const db = (await import('../db.js')).db;
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const tasks = await db.taskInstance.findMany({
    where: {
      dueDate: { gte: now, lte: sevenDaysFromNow },
      status: { in: ['pending', 'in_progress'] },
    },
    include: {
      run: { include: { employee: { select: { name: true } } } },
      taskTemplate: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  return tasks;
}

// GET /api/dashboard/metrics - Get dashboard metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const metrics = await getMetrics();
    res.json({
      data: metrics,
      message: 'Dashboard metrics retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/activity-feed - Get activity feed with pagination and filters
router.get('/activity-feed', async (req, res, next) => {
  try {
    const {
      type,
      employeeId,
      candidateId,
      deviceId,
      offerId,
      limit = '20',
      offset = '0',
    } = req.query;

    const result = await getActivityFeed({
      type,
      employeeId,
      candidateId,
      deviceId,
      offerId,
      limit: Math.min(Math.max(parseInt(limit) || 20, 1), 100),
      offset: Math.max(parseInt(offset) || 0, 0),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/dashboard/log-activity - Create activity log (internal use)
router.post('/log-activity', async (req, res, next) => {
  try {
    const { type, description, employeeId, candidateId, deviceId, offerId, metadata } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        error: 'type and description are required',
      });
    }

    const activity = await logActivity({
      type,
      description,
      employeeId,
      candidateId,
      deviceId,
      offerId,
      metadata,
    });

    res.status(201).json({
      data: activity,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/widgets/candidate-stage - Get candidate stage distribution
router.get('/widgets/candidate-stage', async (req, res, next) => {
  try {
    const data = await getCandidateStageWidget();
    res.json({
      data,
      message: 'Candidate stage widget retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/widgets/onboarding-progress - Get onboarding progress
router.get('/widgets/onboarding-progress', async (req, res, next) => {
  try {
    const data = await getOnboardingProgressWidget();
    res.json({
      data,
      message: 'Onboarding progress widget retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/widgets/device-inventory - Get device inventory
router.get('/widgets/device-inventory', async (req, res, next) => {
  try {
    const data = await getDeviceInventoryWidget();
    res.json({
      data,
      message: 'Device inventory widget retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/widgets/team-activity - Get team activity
router.get('/widgets/team-activity', async (req, res, next) => {
  try {
    const data = await getTeamActivityWidget();
    res.json({
      data,
      message: 'Team activity widget retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
