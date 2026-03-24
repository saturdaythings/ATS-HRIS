import express from 'express';

const router = express.Router();

// GET /api/onboarding - List all onboarding runs
router.get('/', async (req, res, next) => {
  try {
    // TODO: Implement onboarding runs listing with TrackTemplate/OnboardingRun models (Phase 5)
    res.json({ message: 'GET /api/onboarding - List onboarding runs (Phase 5)', data: [], error: null });
  } catch (error) {
    next(error);
  }
});

export default router;
