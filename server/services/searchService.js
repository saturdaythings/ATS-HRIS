/**
 * Search Service
 * Handles unified search across candidates, employees, devices, and activity log
 */

import { db } from '../db.js';

/**
 * Search candidates
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Search results
 */
export async function searchCandidates(query, filters = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const where = {
      deletedAt: null, // Exclude soft-deleted
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { role: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply additional filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.stage) {
      where.stage = filters.stage;
    }

    const results = await db.candidate.findMany({
      where,
      include: {
        source: { select: { id: true, label: true } },
        client: { select: { id: true, name: true } },
      },
      take: 20,
    });

    return results.map(c => ({
      id: c.id,
      type: 'candidate',
      name: c.name,
      email: c.email,
      role: c.role,
      status: c.status,
      stage: c.stage,
      subtitle: `${c.role} • ${c.status}`,
      description: c.email,
    }));
  } catch (error) {
    throw new Error(`Failed to search candidates: ${error.message}`);
  }
}

/**
 * Search employees
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Search results
 */
export async function searchEmployees(query, filters = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const where = {
      deletedAt: null, // Exclude soft-deleted
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
        { role: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply additional filters
    if (filters.department) {
      where.department = filters.department;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const results = await db.employee.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      take: 20,
    });

    return results.map(e => ({
      id: e.id,
      type: 'employee',
      name: e.name,
      email: e.email,
      department: e.department,
      status: e.status,
      subtitle: `${e.department || 'N/A'} • ${e.status}`,
      description: e.email,
    }));
  } catch (error) {
    throw new Error(`Failed to search employees: ${error.message}`);
  }
}

/**
 * Search devices
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Search results
 */
export async function searchDevices(query, filters = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const where = {
      deletedAt: null, // Exclude soft-deleted
      OR: [
        { serialNumber: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply additional filters
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const results = await db.device.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
      },
      take: 20,
    });

    return results.map(d => ({
      id: d.id,
      type: 'device',
      name: d.serialNumber || d.model,
      deviceType: d.type,
      status: d.status,
      assignee: d.assignee?.name || 'Unassigned',
      subtitle: `${d.type} • ${d.status}`,
      description: d.serialNumber || d.model || 'No serial',
    }));
  } catch (error) {
    throw new Error(`Failed to search devices: ${error.message}`);
  }
}

/**
 * Search activity log
 * @param {string} query - Search query (searches user name, action, details)
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Search results
 */
export async function searchActivity(query, filters = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const where = {
      OR: [
        { action: { contains: query, mode: 'insensitive' } },
        { entityType: { contains: query, mode: 'insensitive' } },
        { details: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
      ],
    };

    // Apply additional filters
    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.action) {
      where.action = filters.action;
    }

    const results = await db.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return results.map(a => ({
      id: a.id,
      type: 'activity',
      action: a.action,
      entityType: a.entityType,
      userName: a.user?.name || 'Unknown',
      userEmail: a.user?.email || '',
      subtitle: `${a.action} • ${a.entityType}`,
      description: a.details || '',
      timestamp: a.createdAt.toISOString(),
    }));
  } catch (error) {
    throw new Error(`Failed to search activity: ${error.message}`);
  }
}

/**
 * Global search across all entities
 * @param {string} query - Search query
 * @param {Object} options - Search options { types: ['candidates', 'employees', 'devices', 'activity'] }
 * @returns {Promise<Object>} Search results grouped by type
 */
export async function globalSearch(query, options = {}) {
  try {
    if (!query || query.trim().length === 0) {
      return {};
    }

    const {
      types = ['candidates', 'employees', 'devices', 'activity'],
      filters = {},
    } = options;

    const results = {};

    if (types.includes('candidates')) {
      results.candidates = await searchCandidates(query, filters.candidates || {});
    }

    if (types.includes('employees')) {
      results.employees = await searchEmployees(query, filters.employees || {});
    }

    if (types.includes('devices')) {
      results.devices = await searchDevices(query, filters.devices || {});
    }

    if (types.includes('activity')) {
      results.activity = await searchActivity(query, filters.activity || {});
    }

    // Flatten and sort by relevance (exact match first, then substring)
    const all = [];
    Object.entries(results).forEach(([type, items]) => {
      items.forEach(item => {
        const exactMatch = item.name?.toLowerCase() === query.toLowerCase() ||
                          item.email?.toLowerCase() === query.toLowerCase();
        all.push({ ...item, exactMatch, type });
      });
    });

    all.sort((a, b) => {
      if (a.exactMatch !== b.exactMatch) {
        return a.exactMatch ? -1 : 1;
      }
      return 0;
    });

    return {
      total: all.length,
      results: all,
      byType: results,
    };
  } catch (error) {
    throw new Error(`Global search failed: ${error.message}`);
  }
}

/**
 * Get search suggestions based on partial query
 * @param {string} prefix - Partial query
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getSearchSuggestions(prefix) {
  try {
    if (!prefix || prefix.trim().length < 2) {
      return [];
    }

    const query = prefix.toLowerCase();
    const suggestions = new Set();

    // Get candidate names and emails
    const candidates = await db.candidate.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: prefix, mode: 'insensitive' } },
          { email: { contains: prefix, mode: 'insensitive' } },
        ],
      },
      select: { name: true, email: true },
      take: 5,
    });

    candidates.forEach(c => {
      if (c.name) suggestions.add(c.name);
      if (c.email) suggestions.add(c.email);
    });

    // Get employee names and emails
    const employees = await db.employee.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: prefix, mode: 'insensitive' } },
          { email: { contains: prefix, mode: 'insensitive' } },
        ],
      },
      select: { name: true, email: true },
      take: 5,
    });

    employees.forEach(e => {
      if (e.name) suggestions.add(e.name);
      if (e.email) suggestions.add(e.email);
    });

    // Get device models and serials
    const devices = await db.device.findMany({
      where: {
        deletedAt: null,
        OR: [
          { serialNumber: { contains: prefix, mode: 'insensitive' } },
          { model: { contains: prefix, mode: 'insensitive' } },
        ],
      },
      select: { serialNumber: true, model: true },
      take: 5,
    });

    devices.forEach(d => {
      if (d.serialNumber) suggestions.add(d.serialNumber);
      if (d.model) suggestions.add(d.model);
    });

    return Array.from(suggestions).slice(0, 10);
  } catch (error) {
    throw new Error(`Failed to get search suggestions: ${error.message}`);
  }
}
