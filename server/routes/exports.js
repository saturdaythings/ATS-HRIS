/**
 * Export Routes
 * Provides endpoints for exporting data to CSV format
 */

import express from 'express';
import * as exportService from '../services/exportService.js';

const router = express.Router();

/**
 * POST /api/exports/candidates
 * Export candidates to CSV
 * Query params:
 *   - filters: JSON string with filter options
 *   - columns: comma-separated column names (optional)
 */
router.post('/candidates', async (req, res) => {
  try {
    const { filters = {}, columns } = req.body;

    // Parse filters if provided as string
    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const columnArray = columns ? columns.split(',').map(c => c.trim()) : null;

    const data = await exportService.exportCandidates(parsedFilters, columnArray);
    const csv = exportService.arrayToCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="candidates-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exports/employees
 * Export employees to CSV
 * Query params:
 *   - filters: JSON string with filter options
 *   - columns: comma-separated column names (optional)
 */
router.post('/employees', async (req, res) => {
  try {
    const { filters = {}, columns } = req.body;

    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const columnArray = columns ? columns.split(',').map(c => c.trim()) : null;

    const data = await exportService.exportEmployees(parsedFilters, columnArray);
    const csv = exportService.arrayToCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="employees-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exports/devices
 * Export devices to CSV
 * Query params:
 *   - filters: JSON string with filter options
 *   - columns: comma-separated column names (optional)
 */
router.post('/devices', async (req, res) => {
  try {
    const { filters = {}, columns } = req.body;

    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const columnArray = columns ? columns.split(',').map(c => c.trim()) : null;

    const data = await exportService.exportDevices(parsedFilters, columnArray);
    const csv = exportService.arrayToCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="devices-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exports/activity
 * Export activity log to CSV
 * Query params:
 *   - filters: JSON string with filter options
 *   - columns: comma-separated column names (optional)
 */
router.post('/activity', async (req, res) => {
  try {
    const { filters = {}, columns } = req.body;

    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const columnArray = columns ? columns.split(',').map(c => c.trim()) : null;

    const data = await exportService.exportActivityLog(parsedFilters, columnArray);
    const csv = exportService.arrayToCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="activity-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exports/bulk
 * Bulk export multiple data types
 * Body:
 *   - types: array of entity types to export (candidates, employees, devices, activity)
 */
router.post('/bulk', async (req, res) => {
  try {
    const { types = ['candidates', 'employees', 'devices', 'activity'] } = req.body;

    // Validate types
    const validTypes = ['candidates', 'employees', 'devices', 'activity'];
    const sanitizedTypes = types.filter(t => validTypes.includes(t));

    if (sanitizedTypes.length === 0) {
      return res.status(400).json({ error: 'No valid export types provided' });
    }

    const exports = await exportService.generateBulkExport({ includeTypes: sanitizedTypes });

    // For now, return JSON. Client can convert to multiple CSVs if needed
    res.json({
      timestamp: new Date().toISOString(),
      exports,
      counts: {
        candidates: exports.candidates?.length || 0,
        employees: exports.employees?.length || 0,
        devices: exports.devices?.length || 0,
        activity: exports.activity?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/exports/status
 * Check export service status
 */
router.get('/status', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
