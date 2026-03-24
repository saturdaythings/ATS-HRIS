import express from 'express';

const router = express.Router();

/**
 * GET /api/admin/custom-fields
 * List all active custom fields (TODO: CustomField model removed, implement in future if needed)
 */
router.get('/', async (req, res, next) => {
  try {
    res.json({ message: 'GET /api/admin/custom-fields - (Deprecated, CustomField model removed)', data: [], error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/custom-fields
 * Create a new custom field (TODO: CustomField model removed)
 */
router.post('/', async (req, res, next) => {
  try {
    res.status(501).json({ error: 'Custom fields feature deprecated - CustomField model removed from schema' });
  } catch (error) {
    next(error);
  }
});

export default router;
