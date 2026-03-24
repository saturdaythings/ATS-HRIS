import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as trackService from '../services/trackService.js';

const router = express.Router();

/**
 * ============================================================================
 * TRACK TEMPLATE ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/tracks
 * List all track templates with optional filters
 * Query params: type (company/role/client), autoApply (true/false)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type, autoApply } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (autoApply !== undefined) filters.autoApply = autoApply;

    const tracks = await trackService.listTracks(filters);
    res.json(tracks);
  } catch (error) {
    console.error('[GET /api/tracks]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tracks
 * Create a new track template
 * Body:
 *   - name (required)
 *   - type (required): company, role, or client
 *   - description (optional)
 *   - clientId (required if type='client')
 *   - autoApply (optional, only for company tracks)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      clientId,
      autoApply,
    } = req.body;

    const track = await trackService.createTrack({
      name,
      type,
      description,
      clientId,
      autoApply,
    });

    res.status(201).json(track);
  } catch (error) {
    if (error.message.includes('is required')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Client not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('must be one of')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('[POST /api/tracks]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tracks/:id
 * Get a single track template with its tasks
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const track = await trackService.getTrack(id);
    res.json(track);
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[GET /api/tracks/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/tracks/:id
 * Update a track template (name, description, autoApply only)
 * Body can include: name, description, autoApply
 */
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const track = await trackService.updateTrack(id, updates);
    res.json(track);
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[PATCH /api/tracks/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tracks/:id
 * Delete a track template (cascades to delete tasks)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await trackService.deleteTrack(id);
    res.status(204).end();
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[DELETE /api/tracks/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================================================
 * TASK TEMPLATE ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/tracks/:trackId/tasks
 * List all task templates for a track, ordered by order field
 */
router.get('/:trackId/tasks', requireAuth, async (req, res) => {
  try {
    const { trackId } = req.params;
    const tasks = await trackService.listTasksForTrack(trackId);
    res.json(tasks);
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[GET /api/tracks/:trackId/tasks]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tracks/:trackId/tasks
 * Create a new task template
 * Body:
 *   - name (required)
 *   - description (optional)
 *   - ownerRole (optional)
 *   - dueDaysOffset (optional): negative for pre-start, 0 for start date, positive for post-start
 *   - order (optional, defaults to 0)
 */
router.post('/:trackId/tasks', requireAdmin, async (req, res) => {
  try {
    const { trackId } = req.params;
    const {
      name,
      description,
      ownerRole,
      dueDaysOffset,
      order,
    } = req.body;

    const task = await trackService.createTask(trackId, {
      name,
      description,
      ownerRole,
      dueDaysOffset,
      order,
    });

    res.status(201).json(task);
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('is required')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('[POST /api/tracks/:trackId/tasks]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tracks/:trackId/tasks/:taskId
 * Get a single task template
 */
router.get('/:trackId/tasks/:taskId', requireAuth, async (req, res) => {
  try {
    const { trackId, taskId } = req.params;
    const task = await trackService.getTask(trackId, taskId);
    res.json(task);
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[GET /api/tracks/:trackId/tasks/:taskId]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/tracks/:trackId/tasks/:taskId
 * Update a task template
 * Body can include: name, description, ownerRole, dueDaysOffset, order
 */
router.patch('/:trackId/tasks/:taskId', requireAdmin, async (req, res) => {
  try {
    const { trackId, taskId } = req.params;
    const updates = req.body;

    const task = await trackService.updateTask(trackId, taskId, updates);
    res.json(task);
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[PATCH /api/tracks/:trackId/tasks/:taskId]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tracks/:trackId/tasks/:taskId
 * Delete a task template
 */
router.delete('/:trackId/tasks/:taskId', requireAdmin, async (req, res) => {
  try {
    const { trackId, taskId } = req.params;
    await trackService.deleteTask(trackId, taskId);
    res.status(204).end();
  } catch (error) {
    if (error.message === 'Track not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Cannot delete')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('[DELETE /api/tracks/:trackId/tasks/:taskId]', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
