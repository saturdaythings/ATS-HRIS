import express from 'express';
import {
  createNotification,
  getNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService.js';

const router = express.Router();

/**
 * POST /api/notifications - Create a notification
 * Body: { type, description, employeeId }
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, description, employeeId } = req.body;

    const notification = await createNotification(type, description, employeeId);

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/:employeeId - List notifications for an employee
 * Query params:
 *   - limit: Number of results (default 25)
 *   - offset: Number to skip (default 0)
 *   - read: Filter by read status (true/false, optional)
 */
router.get('/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { limit, offset, read } = req.query;

    // Parse filters
    const filters = {};
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);
    if (read !== undefined) {
      filters.read = read === 'true'; // Convert string to boolean
    }

    const notifications = await listNotifications(employeeId, filters);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/:notificationId - Mark single notification as read
 * Body: Empty (read status is set to true)
 */
router.patch('/:notificationId', async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await markAsRead(notificationId);

    res.json(notification);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/read-all/:employeeId - Mark all unread notifications as read
 * Body: Empty
 */
router.patch('/read-all/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const result = await markAllAsRead(employeeId);

    res.json({
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:notificationId - Delete a notification
 */
router.delete('/:notificationId', async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    await deleteNotification(notificationId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
