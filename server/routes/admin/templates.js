import express from 'express';

const router = express.Router();

// In-memory store for templates
let templates = [
  {
    id: '1',
    name: 'Engineering Onboarding',
    role: 'engineer',
    items: [
      { id: '1-1', task: 'Set up development environment', dueDay: 1, assignee: 'tech-lead' },
      { id: '1-2', task: 'Code repository access', dueDay: 1, assignee: 'devops' },
      { id: '1-3', task: 'Deploy workflow review', dueDay: 3, assignee: 'tech-lead' },
      { id: '1-4', task: 'Team architecture overview', dueDay: 5, assignee: 'architect' }
    ],
    createdAt: new Date('2026-01-15')
  },
  {
    id: '2',
    name: 'Sales Onboarding',
    role: 'sales',
    items: [
      { id: '2-1', task: 'CRM platform training', dueDay: 1, assignee: 'sales-manager' },
      { id: '2-2', task: 'Product knowledge overview', dueDay: 2, assignee: 'product' },
      { id: '2-3', task: 'Sales process walkthrough', dueDay: 3, assignee: 'sales-lead' },
      { id: '2-4', task: 'Territory assignment', dueDay: 5, assignee: 'sales-manager' }
    ],
    createdAt: new Date('2026-01-20')
  },
  {
    id: '3',
    name: 'HR Admin Onboarding',
    role: 'hr-admin',
    items: [
      { id: '3-1', task: 'System access setup', dueDay: 1, assignee: 'hr-manager' },
      { id: '3-2', task: 'Benefits system overview', dueDay: 2, assignee: 'benefits-admin' }
    ],
    createdAt: new Date('2026-02-01')
  }
];

let idCounter = 4;

// GET /api/admin/templates - List all templates
router.get('/', (req, res) => {
  try {
    res.json({ templates, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/templates - Create new template
router.post('/', (req, res) => {
  try {
    const { name, role, items } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Missing name or role' });
    }

    const template = {
      id: String(idCounter++),
      name,
      role,
      items: items || [],
      createdAt: new Date()
    };

    templates.push(template);
    res.status(201).json({ data: template, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/templates/:id - Update template
router.patch('/:id', (req, res) => {
  try {
    const { name, role, items } = req.body;
    const template = templates.find(t => t.id === req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (name) template.name = name;
    if (role) template.role = role;
    if (items) template.items = items;

    res.json({ data: template, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/templates/:id - Delete template
router.delete('/:id', (req, res) => {
  try {
    const index = templates.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Template not found' });
    }

    templates.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
