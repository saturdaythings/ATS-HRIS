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
