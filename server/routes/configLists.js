import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/**
 * POST /api/config-lists
 * Create a new configuration list
 * Body: { name, description, items }
 *   items: Array of { label, value, order }
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, items = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const configList = await db.configList.create({
      data: {
        name,
        description: description || null,
        items: {
          create: items.map((item, index) => ({
            label: item.label,
            value: item.value || item.label,
            order: item.order !== undefined ? item.order : index,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(configList);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Config list name already exists' });
    }
    console.error('[POST /api/config-lists]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/config-lists
 * List all configuration lists
 */
router.get('/', async (req, res) => {
  try {
    const lists = await db.configList.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
    });

    res.json(lists);
  } catch (error) {
    console.error('[GET /api/config-lists]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/config-lists/:id
 * Get a specific configuration list with items
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const configList = await db.configList.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    if (!configList) {
      return res.status(404).json({ error: 'Config list not found' });
    }

    res.json(configList);
  } catch (error) {
    console.error('[GET /api/config-lists/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/config-lists/name/:name
 * Get a configuration list by name
 */
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const configList = await db.configList.findUnique({
      where: { name },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    if (!configList) {
      return res.status(404).json({ error: 'Config list not found' });
    }

    res.json(configList);
  } catch (error) {
    console.error('[GET /api/config-lists/name/:name]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/config-lists/:id/items
 * Add an item to a config list
 * Body: { label, value, order }
 */
router.post('/:id/items', async (req, res) => {
  try {
    const { id: listId } = req.params;
    const { label, value, order } = req.body;

    if (!label) {
      return res.status(400).json({ error: 'label is required' });
    }

    // Verify list exists
    const configList = await db.configList.findUnique({ where: { id: listId } });
    if (!configList) {
      return res.status(404).json({ error: 'Config list not found' });
    }

    const item = await db.configListItem.create({
      data: {
        listId,
        label,
        value: value || label,
        order: order !== undefined ? order : 0,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Item value already exists in this list' });
    }
    console.error('[POST /api/config-lists/:id/items]', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
