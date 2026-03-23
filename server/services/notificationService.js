import { db } from '../db.js';

/**
 * Notification Service
 * Handles CRUD operations for notifications
 * Supports filtering, pagination, and bulk operations
 */

// Valid notification types
const VALID_TYPES = [
  'task_assignment',
  'task_due',
  'task_overdue',
  'employee_hired',
  'completion',
  'device_assigned',
];

/**
 * Validate notification type
 * @param {string} type - Notification type to validate
 * @throws {Error} If type is invalid
 */
export function validateNotificationType(type) {
  if (!type || !VALID_TYPES.includes(type)) {
    throw new Error('Invalid notification type');
  }
}

/**
 * Create a notification
 * @param {string} type - Notification type
 * @param {string} description - Notification description
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(type, description, employeeId) {
  // Validate required fields
  if (!type) throw new Error('Notification type is required');
  if (!description) throw new Error('Description is required');
  if (!employeeId) throw new Error('Employee ID is required');

  // Validate type
  validateNotificationType(type);

  // Check employee exists
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Create notification
  const notification = await db.notification.create({
    data: {
      type,
      description,
      employeeId,
      read: false,
    },
  });

  return notification;
}

/**
 * Get notification by ID
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Notification
 */
export async function getNotification(id) {
  const notification = await db.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
}

/**
 * List notifications for an employee
 * Ordered by createdAt DESC (newest first), with unread first
 * @param {string} employeeId - Employee ID
 * @param {Object} filters - Filter options
 * @param {number} filters.limit - Number of results (default 25)
 * @param {number} filters.offset - Number to skip (default 0)
 * @param {boolean} filters.read - Filter by read status (optional)
 * @returns {Promise<Array>} Notifications
 */
export async function listNotifications(employeeId, filters = {}) {
  const { limit = 25, offset = 0, read } = filters;

  // Build where clause
  const where = {
    employeeId,
  };

  if (read !== undefined) {
    where.read = read;
  }

  // Get notifications ordered by read status (false first) then createdAt DESC
  const notifications = await db.notification.findMany({
    where,
    orderBy: [
      { read: 'asc' }, // false (unread) comes before true (read)
      { createdAt: 'desc' }, // Newest first
    ],
    skip: offset,
    take: limit,
  });

  return notifications;
}

/**
 * Mark a single notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export async function markAsRead(id) {
  const notification = await db.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  const updated = await db.notification.update({
    where: { id },
    data: {
      read: true,
    },
  });

  return updated;
}

/**
 * Mark all unread notifications as read for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Update result with count
 */
export async function markAllAsRead(employeeId) {
  const result = await db.notification.updateMany({
    where: {
      employeeId,
      read: false, // Only update unread
    },
    data: {
      read: true,
    },
  });

  return result;
}

/**
 * Delete a notification
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Deleted notification
 */
export async function deleteNotification(id) {
  const notification = await db.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  const deleted = await db.notification.delete({
    where: { id },
  });

  return deleted;
}
