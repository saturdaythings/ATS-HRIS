import express from 'express';
import os from 'os';
import { db } from '../../db.js';

const router = express.Router();

const SERVER_START_TIME = Date.now();

// GET /api/admin/health - Get system health and metrics
router.get('/', async (req, res) => {
  try {
    // Database connectivity check
    let dbConnected = false;
    let dbLatency = 0;

    try {
      const startTime = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - startTime;
      dbConnected = true;
    } catch (error) {
      dbConnected = false;
    }

    // Calculate uptime in seconds
    const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);

    // Get memory usage
    const memUsage = process.memoryUsage();

    // Get CPU load average
    const cpuLoad = os.loadavg();

    const healthData = {
      status: dbConnected ? 'healthy' : 'degraded',
      uptime,
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        latency: dbLatency // milliseconds
      },
      api: {
        endpoints: 30, // Approximate number of endpoints
        requestsPerMinute: Math.floor(Math.random() * 100), // Stub value
        avgResponseTime: Math.floor(Math.random() * 100) // milliseconds, stub value
      },
      server: {
        version: '1.0.0',
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024) // MB
        },
        cpu: {
          loadAverage: {
            '1m': cpuLoad[0].toFixed(2),
            '5m': cpuLoad[1].toFixed(2),
            '15m': cpuLoad[2].toFixed(2)
          }
        }
      }
    };

    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
