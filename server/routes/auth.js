import express from 'express';
import { verifyPassword, requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// GET /api/auth/session
router.get('/session', requireAuth, async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.session.userId } });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

export default router;
