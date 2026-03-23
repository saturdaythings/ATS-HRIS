import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/activities - Get activity feed with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { type, employeeId, deviceId, limit = '20', offset = '0' } = req.query;

    const parseLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100); // Max 100
    const parseOffset = Math.max(parseInt(offset) || 0, 0);

    // Build where clause for filtering
    const where = {};
    if (type) {
      where.type = type;
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (deviceId) {
      where.deviceId = deviceId;
    }

    // Fetch activities with related data
    const activities = await db.activity.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        device: {
          select: {
            id: true,
            serial: true,
            type: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseLimit,
      skip: parseOffset,
    });

    res.json({
      activities,
      limit: parseLimit,
      offset: parseOffset,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      message: error.message,
    });
  }
});

// POST /api/activities - Create activity log (internal only)
router.post('/', async (req, res) => {
  try {
    const { type, description, employeeId, deviceId } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: type, description',
      });
    }

    const activity = await db.activity.create({
      data: {
        type,
        description,
        employeeId: employeeId || null,
        deviceId: deviceId || null,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        device: {
          select: {
            id: true,
            serial: true,
            type: true,
            make: true,
            model: true,
          },
        },
      },
    });

    res.status(201).json({
      data: activity,
      message: 'Activity created successfully',
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      error: 'Failed to create activity',
      message: error.message,
    });
  }
});

export default router;
