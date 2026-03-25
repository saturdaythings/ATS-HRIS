import express from 'express';

const router = express.Router();

const VALID_STATUSES = ['open', 'in-progress', 'completed', 'rejected'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// In-memory store using Map
const store = new Map([
  [
    '1',
    {
      id: '1',
      title: 'Mobile app for time tracking',
      description: 'Allow employees to track time on their phones during field work',
      status: 'open',
      priority: 'high',
      votes: 12,
      createdAt: new Date('2026-02-15'),
      createdBy: 'user-123'
    }
  ],
  [
    '2',
    {
      id: '2',
      title: 'Integration with Slack for notifications',
      description: 'Send onboarding reminders and approvals to Slack',
      status: 'in-progress',
      priority: 'high',
      votes: 8,
      createdAt: new Date('2026-02-20'),
      createdBy: 'user-456'
    }
  ],
  [
    '3',
    {
      id: '3',
      title: 'Export to PDF reports',
      description: 'Generate professional PDF reports for hiring pipeline and employee data',
      status: 'completed',
      priority: 'medium',
      votes: 5,
      createdAt: new Date('2026-01-10'),
      createdBy: 'user-789'
    }
  ],
  [
    '4',
    {
      id: '4',
      title: 'Advanced filtering on device inventory',
      description: 'Filter devices by purchase date, warranty expiration, and custom tags',
      status: 'open',
      priority: 'low',
      votes: 3,
      createdAt: new Date('2026-03-05'),
      createdBy: 'user-101'
    }
  ],
  [
    '5',
    {
      id: '5',
      title: 'Batch operations for employee records',
      description: 'Update multiple employee records at once (roles, departments, etc.)',
      status: 'open',
      priority: 'medium',
      votes: 7,
      createdAt: new Date('2026-03-10'),
      createdBy: 'user-202'
    }
  ]
]);

let nextId = 6;

// GET /api/admin/feature-requests - List feature requests with optional filtering
router.get('/', (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;
    let results = Array.from(store.values());

    // Filter by status
    if (status && VALID_STATUSES.includes(status)) {
      results = results.filter(r => r.status === status);
    }

    // Filter by priority
    if (priority && VALID_PRIORITIES.includes(priority)) {
      results = results.filter(r => r.priority === priority);
    }

    // Sort by votes (default) or date
    if (sortBy === 'date') {
      results.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      results.sort((a, b) => b.votes - a.votes);
    }

    res.json({ data: results, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/feature-requests - Create new feature request
router.post('/', (req, res) => {
  try {
    const { title, description, priority, createdBy } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing title or description' });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    const id = String(nextId++);
    const featureRequest = {
      id,
      title,
      description,
      status: 'open',
      priority: priority || 'medium',
      votes: 0,
      createdAt: new Date(),
      createdBy: createdBy || 'anonymous'
    };

    store.set(id, featureRequest);
    res.status(201).json({ data: featureRequest, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/feature-requests/:id - Update feature request
router.patch('/:id', (req, res) => {
  try {
    const featureRequest = store.get(req.params.id);

    if (!featureRequest) {
      return res.status(404).json({ error: 'Feature request not found' });
    }

    const { title, description, status, priority, votes } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    if (title !== undefined) featureRequest.title = title;
    if (description !== undefined) featureRequest.description = description;
    if (status !== undefined) featureRequest.status = status;
    if (priority !== undefined) featureRequest.priority = priority;
    if (votes !== undefined) featureRequest.votes = votes;

    store.set(req.params.id, featureRequest);
    res.json({ data: featureRequest, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/feature-requests/:id - Delete feature request
router.delete('/:id', (req, res) => {
  try {
    if (!store.has(req.params.id)) {
      return res.status(404).json({ error: 'Feature request not found' });
    }

    store.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
