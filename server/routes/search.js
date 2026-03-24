/**
 * Search Routes
 * Provides endpoints for global search across all entities
 */

import express from 'express';
import * as searchService from '../services/searchService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/search
 * Global search across all entities
 * Query params:
 *   - q: Search query (required)
 *   - types: Comma-separated types to search (candidates, employees, devices, activity)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { q, types } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const searchTypes = types
      ? types.split(',').map(t => t.trim())
      : ['candidates', 'employees', 'devices', 'activity'];

    const results = await searchService.globalSearch(q, { types: searchTypes });

    res.json({
      query: q,
      ...results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/candidates
 * Search candidates only
 * Query params:
 *   - q: Search query (required)
 *   - status: Filter by status (optional)
 *   - stage: Filter by stage (optional)
 */
router.get('/candidates', requireAuth, async (req, res) => {
  try {
    const { q, status, stage } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const filters = {};
    if (status) filters.status = status;
    if (stage) filters.stage = stage;

    const results = await searchService.searchCandidates(q, filters);

    res.json({
      query: q,
      type: 'candidates',
      results,
      count: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/employees
 * Search employees only
 * Query params:
 *   - q: Search query (required)
 *   - department: Filter by department (optional)
 *   - status: Filter by status (optional)
 */
router.get('/employees', requireAuth, async (req, res) => {
  try {
    const { q, department, status } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const filters = {};
    if (department) filters.department = department;
    if (status) filters.status = status;

    const results = await searchService.searchEmployees(q, filters);

    res.json({
      query: q,
      type: 'employees',
      results,
      count: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/devices
 * Search devices only
 * Query params:
 *   - q: Search query (required)
 *   - type: Filter by device type (optional)
 *   - status: Filter by status (optional)
 */
router.get('/devices', requireAuth, async (req, res) => {
  try {
    const { q, type, status } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    const results = await searchService.searchDevices(q, filters);

    res.json({
      query: q,
      type: 'devices',
      results,
      count: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/activity
 * Search activity log only
 * Query params:
 *   - q: Search query (required)
 *   - entityType: Filter by entity type (optional)
 *   - action: Filter by action (optional)
 */
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const { q, entityType, action } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const filters = {};
    if (entityType) filters.entityType = entityType;
    if (action) filters.action = action;

    const results = await searchService.searchActivity(q, filters);

    res.json({
      query: q,
      type: 'activity',
      results,
      count: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions based on prefix
 * Query params:
 *   - prefix: Partial query (required, minimum 2 chars)
 */
router.get('/suggestions', requireAuth, async (req, res) => {
  try {
    const { prefix } = req.query;

    if (!prefix || prefix.trim().length < 2) {
      return res.status(400).json({ error: 'Prefix must be at least 2 characters' });
    }

    const suggestions = await searchService.getSearchSuggestions(prefix);

    res.json({
      prefix,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/search/status
 * Check search service status
 */
router.get('/status', requireAuth, async (req, res) => {
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
