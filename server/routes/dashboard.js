import express from 'express';

const router = express.Router();

// GET /api/dashboard/metrics - Get dashboard metrics
router.get('/metrics', async (req, res) => {
  // TODO: Implement metrics retrieval (hiring pipeline, hires, devices, onboarding progress)
  res.json({ message: 'GET /api/dashboard/metrics - Get metrics (Phase 2)' });
});

export default router;
