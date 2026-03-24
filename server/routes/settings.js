import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { listUsers, inviteUser, updateUserRole, deleteUser, listLists, listItems, createItem, updateItem, deleteItem } from '../services/settingsService.js';

const router = express.Router();

// ===== USERS =====
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ data: users, error: null });
  } catch (error) {
    next(error);
  }
});

router.post('/users/invite', requireAdmin, async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'Missing email or role' });
    const user = await inviteUser(email, role);
    res.status(201).json({ data: user, error: null });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/role', requireAdmin, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Missing role' });
    const user = await updateUserRole(req.params.id, role);
    res.json({ data: user, error: null });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    if (req.session.userId === req.params.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ===== CONFIGLISTS =====
router.get('/lists', async (req, res, next) => {
  try {
    const lists = await listLists();
    res.json({ data: lists, error: null });
  } catch (error) {
    next(error);
  }
});

router.get('/lists/:id/items', async (req, res, next) => {
  try {
    const items = await listItems(req.params.id);
    res.json({ data: items, error: null });
  } catch (error) {
    next(error);
  }
});

router.post('/lists/:id/items', requireAdmin, async (req, res, next) => {
  try {
    const { label, value, order } = req.body;
    if (!label) return res.status(400).json({ error: 'Missing label' });
    const item = await createItem(req.params.id, label, value, order);
    res.status(201).json({ data: item, error: null });
  } catch (error) {
    next(error);
  }
});

router.patch('/lists/:id/items/:itemId', requireAdmin, async (req, res, next) => {
  try {
    const { label, value, order } = req.body;
    const item = await updateItem(req.params.itemId, label, value, order);
    res.json({ data: item, error: null });
  } catch (error) {
    next(error);
  }
});

router.delete('/lists/:id/items/:itemId', requireAdmin, async (req, res, next) => {
  try {
    await deleteItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
