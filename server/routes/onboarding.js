import express from 'express';
import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  createChecklistFromTemplate,
  getChecklist,
  listChecklistsByEmployee,
  getChecklistProgress,
  markItemComplete,
} from '../services/onboardingService.js';

const router = express.Router();

// ============ Template Routes (Admin) ============

/**
 * POST /api/onboarding/templates
 * Create a new onboarding template
 */
router.post('/templates', async (req, res, next) => {
  try {
    const { name, role, items } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        error: 'Missing required fields: name, role',
      });
    }

    const template = await createTemplate({
      name,
      role,
      items: items || [],
    });

    res.status(201).json({ data: template, error: null });
  } catch (error) {
    if (
      error.message.includes('required') ||
      error.message.includes('must be')
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/onboarding/templates
 * List all templates, optionally filtered by role
 */
router.get('/templates', async (req, res, next) => {
  try {
    const { role } = req.query;
    const templates = await listTemplates(role ? { role } : {});
    res.json({ data: templates, error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/onboarding/templates/:id
 * Get a specific template
 */
router.get('/templates/:id', async (req, res, next) => {
  try {
    const template = await getTemplate(req.params.id);
    res.json({ data: template, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/onboarding/templates/:id
 * Update a template
 */
router.patch('/templates/:id', async (req, res, next) => {
  try {
    const { name, role, items } = req.body;

    const template = await updateTemplate(req.params.id, {
      name,
      role,
      items,
    });

    res.json({ data: template, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (
      error.message.includes('required') ||
      error.message.includes('must be')
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /api/onboarding/templates/:id
 * Delete a template
 */
router.delete('/templates/:id', async (req, res, next) => {
  try {
    await deleteTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// ============ Checklist Routes ============

/**
 * POST /api/onboarding/checklists
 * Create a new checklist from a template
 */
router.post('/checklists', async (req, res, next) => {
  try {
    const { employeeId, templateId } = req.body;

    if (!employeeId || !templateId) {
      return res.status(400).json({
        error: 'Missing required fields: employeeId, templateId',
      });
    }

    const checklist = await createChecklistFromTemplate(employeeId, templateId);
    res.status(201).json({ data: checklist, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/onboarding/checklists/:employeeId
 * Get all checklists for an employee
 */
router.get('/checklists/:employeeId', async (req, res, next) => {
  try {
    const checklists = await listChecklistsByEmployee(req.params.employeeId);
    res.json({ data: checklists, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/onboarding/checklists/:checklistId/progress
 * Get progress for a checklist
 */
router.get('/checklists/:checklistId/progress', async (req, res, next) => {
  try {
    const progress = await getChecklistProgress(req.params.checklistId);
    res.json({ data: progress, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/onboarding/checklists/detail/:checklistId
 * Get a specific checklist with all details
 */
router.get('/checklists/detail/:checklistId', async (req, res, next) => {
  try {
    const checklist = await getChecklist(req.params.checklistId);
    res.json({ data: checklist, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/onboarding/checklists/:checklistId/items/:itemId
 * Mark a checklist item as complete
 */
router.patch('/checklists/:checklistId/items/:itemId', async (req, res, next) => {
  try {
    const { completedBy } = req.body;

    if (!completedBy) {
      return res.status(400).json({
        error: 'Missing required field: completedBy',
      });
    }

    const item = await markItemComplete(req.params.itemId, completedBy);
    res.json({ data: item, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('required')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
