/**
 * Export Service
 * Handles CSV generation and data export for candidates, employees, devices, and activity logs
 */

import { db } from '../db.js';

/**
 * Export candidates to CSV format
 * @param {Object} filters - Filter options (status, stage, sourceId, clientId, etc.)
 * @param {Array<string>} columns - Specific columns to export (default: all)
 * @returns {Promise<Array>} Array of objects ready for CSV
 */
export async function exportCandidates(filters = {}, columns = null) {
  try {
    const where = {};

    // Apply filters
    if (filters.status) {
      where.status = { in: Array.isArray(filters.status) ? filters.status : [filters.status] };
    }
    if (filters.stage) {
      where.stage = filters.stage;
    }
    if (filters.sourceId) {
      where.sourceId = filters.sourceId;
    }
    if (filters.seniorityId) {
      where.seniorityId = filters.seniorityId;
    }
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }
    if (filters.dateRangeFrom || filters.dateRangeTo) {
      where.createdAt = {};
      if (filters.dateRangeFrom) {
        where.createdAt.gte = new Date(filters.dateRangeFrom);
      }
      if (filters.dateRangeTo) {
        where.createdAt.lte = new Date(filters.dateRangeTo);
      }
    }

    const candidates = await db.candidate.findMany({
      where: { ...where, deletedAt: null }, // Exclude soft-deleted
      include: {
        source: true,
        seniority: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to export format
    const data = candidates.map(c => ({
      'ID': c.id,
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone || '',
      'Role': c.role,
      'Status': c.status,
      'Stage': c.stage,
      'Source': c.source?.label || '',
      'Seniority': c.seniority?.label || '',
      'Client': c.client?.name || '',
      'Skills': (c.skillTags || []).join(', '),
      'Notes': c.notes || '',
      'Created Date': c.createdAt.toISOString().split('T')[0],
      'Updated Date': c.updatedAt.toISOString().split('T')[0],
    }));

    if (columns) {
      return data.map(row => {
        const filtered = {};
        columns.forEach(col => {
          filtered[col] = row[col];
        });
        return filtered;
      });
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to export candidates: ${error.message}`);
  }
}

/**
 * Export employees to CSV format
 * @param {Object} filters - Filter options (department, status, etc.)
 * @param {Array<string>} columns - Specific columns to export (default: all)
 * @returns {Promise<Array>} Array of objects ready for CSV
 */
export async function exportEmployees(filters = {}, columns = null) {
  try {
    const where = { deletedAt: null }; // Exclude soft-deleted

    if (filters.department) {
      where.department = filters.department;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const employees = await db.employee.findMany({
      where,
      include: {
        client: true,
        track: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = employees.map(e => ({
      'ID': e.id,
      'Name': e.name,
      'Email': e.email,
      'Phone': e.phone || '',
      'Department': e.department,
      'Role': e.role || '',
      'Status': e.status,
      'Hire Date': e.hireDate?.toISOString().split('T')[0] || '',
      'Client': e.client?.name || '',
      'Notes': e.notes || '',
      'Created Date': e.createdAt.toISOString().split('T')[0],
      'Updated Date': e.updatedAt.toISOString().split('T')[0],
    }));

    if (columns) {
      return data.map(row => {
        const filtered = {};
        columns.forEach(col => {
          filtered[col] = row[col];
        });
        return filtered;
      });
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to export employees: ${error.message}`);
  }
}

/**
 * Export devices to CSV format
 * @param {Object} filters - Filter options (type, status, assigneeId, etc.)
 * @param {Array<string>} columns - Specific columns to export (default: all)
 * @returns {Promise<Array>} Array of objects ready for CSV
 */
export async function exportDevices(filters = {}, columns = null) {
  try {
    const where = { deletedAt: null }; // Exclude soft-deleted

    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    const devices = await db.device.findMany({
      where,
      include: {
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = devices.map(d => ({
      'ID': d.id,
      'Type': d.type,
      'Serial Number': d.serialNumber || '',
      'Model': d.model || '',
      'Status': d.status,
      'Assigned To': d.assignee?.name || 'Unassigned',
      'Assigned Date': d.assignedDate?.toISOString().split('T')[0] || '',
      'Notes': d.notes || '',
      'Purchase Date': d.purchaseDate?.toISOString().split('T')[0] || '',
      'Created Date': d.createdAt.toISOString().split('T')[0],
      'Updated Date': d.updatedAt.toISOString().split('T')[0],
    }));

    if (columns) {
      return data.map(row => {
        const filtered = {};
        columns.forEach(col => {
          filtered[col] = row[col];
        });
        return filtered;
      });
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to export devices: ${error.message}`);
  }
}

/**
 * Export activity log to CSV format
 * @param {Object} filters - Filter options (userId, entityType, action, dateRange, etc.)
 * @param {Array<string>} columns - Specific columns to export (default: all)
 * @returns {Promise<Array>} Array of objects ready for CSV
 */
export async function exportActivityLog(filters = {}, columns = null) {
  try {
    const where = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.dateRangeFrom || filters.dateRangeTo) {
      where.createdAt = {};
      if (filters.dateRangeFrom) {
        where.createdAt.gte = new Date(filters.dateRangeFrom);
      }
      if (filters.dateRangeTo) {
        where.createdAt.lte = new Date(filters.dateRangeTo);
      }
    }

    const activities = await db.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit to prevent huge exports
    });

    const data = activities.map(a => ({
      'ID': a.id,
      'User': a.user?.name || 'Unknown',
      'Email': a.user?.email || '',
      'Action': a.action,
      'Entity Type': a.entityType,
      'Entity ID': a.entityId,
      'Details': a.details || '',
      'Timestamp': a.createdAt.toISOString(),
    }));

    if (columns) {
      return data.map(row => {
        const filtered = {};
        columns.forEach(col => {
          filtered[col] = row[col];
        });
        return filtered;
      });
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to export activity log: ${error.message}`);
  }
}

/**
 * Convert data array to CSV string
 * @param {Array<Object>} data - Array of objects to convert
 * @returns {string} CSV formatted string
 */
export function arrayToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Generate bulk export with all data types
 * @param {Object} options - Export options { includeTypes: ['candidates', 'employees', 'devices', 'activity'] }
 * @returns {Promise<Object>} Object with data for each type
 */
export async function generateBulkExport(options = {}) {
  try {
    const result = {};
    const { includeTypes = ['candidates', 'employees', 'devices', 'activity'] } = options;

    if (includeTypes.includes('candidates')) {
      result.candidates = await exportCandidates({});
    }

    if (includeTypes.includes('employees')) {
      result.employees = await exportEmployees({});
    }

    if (includeTypes.includes('devices')) {
      result.devices = await exportDevices({});
    }

    if (includeTypes.includes('activity')) {
      result.activity = await exportActivityLog({});
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to generate bulk export: ${error.message}`);
  }
}
