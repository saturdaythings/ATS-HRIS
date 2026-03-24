import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * POST /api/track-templates
 * Create a new track template
 * Body: { name, type, description, autoApply, clientId }
 */
router.post('/', async (req, res) => {
  try {
    const { name, type, description, autoApply = false, clientId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    const track = await db.trackTemplate.create({
      data: {
        name,
        type,
        description: description || null,
        autoApply,
        clientId: clientId || null,
      },
    });

    res.status(201).json(track);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Track name already exists for this type/client' });
    }
    console.error('[POST /api/track-templates]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/track-templates
 * List all track templates with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { type, clientId } = req.query;

    const where = {};
    if (type) where.type = type;
    if (clientId) where.clientId = clientId;

    const tracks = await db.trackTemplate.findMany({
      where,
      include: { tasks: { orderBy: { order: 'asc' } } },
    });

    res.json(tracks);
  } catch (error) {
    console.error('[GET /api/track-templates]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/track-templates/:id
 * Get a specific track template with tasks
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const track = await db.trackTemplate.findUnique({
      where: { id },
      include: { tasks: { orderBy: { order: 'asc' } } },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track template not found' });
    }

    res.json(track);
  } catch (error) {
    console.error('[GET /api/track-templates/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/track-templates/:id/tasks
 * Add a task template to a track
 * Body: { name, description, ownerRole, dueDaysOffset, order }
 */
router.post('/:id/tasks', async (req, res) => {
  try {
    const { id: trackId } = req.params;
    const { name, description, ownerRole, dueDaysOffset, order = 0 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // Verify track exists
    const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
    if (!track) {
      return res.status(404).json({ error: 'Track template not found' });
    }

    const task = await db.taskTemplate.create({
      data: {
        trackId,
        name,
        description: description || null,
        ownerRole: ownerRole || null,
        dueDaysOffset: dueDaysOffset !== undefined ? dueDaysOffset : null,
        order,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('[POST /api/track-templates/:id/tasks]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/track-templates/:id/tasks
 * List all tasks for a track template
 */
router.get('/:id/tasks', async (req, res) => {
  try {
    const { id: trackId } = req.params;

    // Verify track exists
    const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
    if (!track) {
      return res.status(404).json({ error: 'Track template not found' });
    }

    const tasks = await db.taskTemplate.findMany({
      where: { trackId },
      orderBy: { order: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('[GET /api/track-templates/:id/tasks]', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
