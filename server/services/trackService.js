import { db } from '../db.js';

/**
 * Track Service
 * Handles CRUD operations for track templates and task templates
 */

// ============================================================================
// TRACK TEMPLATE OPERATIONS
// ============================================================================

/**
 * List all track templates with their tasks
 * @param {Object} filters - Optional filters (type, autoApply)
 * @returns {Promise<Array>} List of track templates with tasks
 */
export async function listTracks(filters = {}) {
  const where = {};

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.autoApply !== undefined) {
    where.autoApply = filters.autoApply === 'true' || filters.autoApply === true;
  }

  const tracks = await db.trackTemplate.findMany({
    where,
    include: {
      tasks: {
        orderBy: { order: 'asc' },
      },
      client: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return tracks;
}

/**
 * Get a single track template with its tasks
 * @param {string} id - Track ID
 * @returns {Promise<Object>} Track template with tasks
 */
export async function getTrack(id) {
  const track = await db.trackTemplate.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { order: 'asc' },
      },
      client: true,
    },
  });

  if (!track) {
    throw new Error('Track not found');
  }

  return track;
}

/**
 * Create a new track template
 * @param {Object} data - Track data
 * @param {string} data.name - Track name (required)
 * @param {string} data.type - Track type: company, role, or client (required)
 * @param {string} data.description - Track description (optional)
 * @param {string} data.clientId - Client ID (required if type='client')
 * @param {boolean} data.autoApply - Auto-apply flag (optional, only for company tracks)
 * @returns {Promise<Object>} Created track
 */
export async function createTrack(data) {
  const {
    name,
    type,
    description = null,
    clientId = null,
    autoApply = false,
  } = data;

  // Validate required fields
  if (!name) throw new Error('name is required');
  if (!type) throw new Error('type is required');

  // Validate type
  const validTypes = ['company', 'role', 'client'];
  if (!validTypes.includes(type)) {
    throw new Error('type must be one of: company, role, client');
  }

  // Validate client track requirements
  if (type === 'client' && !clientId) {
    throw new Error('clientId is required for client-type tracks');
  }

  // Verify client exists if clientId provided
  if (clientId) {
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new Error('Client not found');
    }
  }

  // Create track
  try {
    const track = await db.trackTemplate.create({
      data: {
        name,
        type,
        description,
        clientId: clientId || null,
        autoApply: type === 'company' ? autoApply : false,
      },
      include: {
        tasks: true,
        client: true,
      },
    });

    return track;
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      throw new Error('Track with this name, type, and client already exists');
    }
    throw error;
  }
}

/**
 * Update a track template
 * @param {string} id - Track ID
 * @param {Object} data - Update data (name, description, autoApply)
 * @returns {Promise<Object>} Updated track
 */
export async function updateTrack(id, data) {
  // Verify track exists
  const existing = await db.trackTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Track not found');
  }

  // Build update object (don't allow type or clientId changes)
  const updateData = {};
  for (const key of Object.keys(data)) {
    if (key === 'type' || key === 'clientId') {
      // Skip type and clientId updates
      continue;
    }
    updateData[key] = data[key];
  }

  // Update track
  const updated = await db.trackTemplate.update({
    where: { id },
    data: updateData,
    include: {
      tasks: {
        orderBy: { order: 'asc' },
      },
      client: true,
    },
  });

  return updated;
}

/**
 * Delete a track template (soft delete)
 * @param {string} id - Track ID
 * @returns {Promise<void>}
 */
export async function deleteTrack(id) {
  // Verify track exists
  const existing = await db.trackTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Track not found');
  }

  // Delete all associated tasks (cascade)
  await db.taskTemplate.deleteMany({
    where: { trackId: id },
  });

  // Delete track
  await db.trackTemplate.delete({ where: { id } });
}

// ============================================================================
// TASK TEMPLATE OPERATIONS
// ============================================================================

/**
 * List all task templates for a track
 * @param {string} trackId - Track ID
 * @returns {Promise<Array>} List of task templates ordered by order field
 */
export async function listTasksForTrack(trackId) {
  // Verify track exists
  const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
  if (!track) {
    throw new Error('Track not found');
  }

  const tasks = await db.taskTemplate.findMany({
    where: { trackId },
    orderBy: { order: 'asc' },
  });

  return tasks;
}

/**
 * Get a single task template
 * @param {string} trackId - Track ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task template
 */
export async function getTask(trackId, taskId) {
  // Verify track exists
  const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
  if (!track) {
    throw new Error('Track not found');
  }

  const task = await db.taskTemplate.findUnique({
    where: { id: taskId },
  });

  if (!task || task.trackId !== trackId) {
    throw new Error('Task not found');
  }

  return task;
}

/**
 * Create a new task template
 * @param {string} trackId - Track ID
 * @param {Object} data - Task data
 * @param {string} data.name - Task name (required)
 * @param {string} data.description - Task description (optional)
 * @param {string} data.ownerRole - Owner role (optional, free text)
 * @param {number} data.dueDaysOffset - Days offset from startDate (optional, can be negative)
 * @param {number} data.order - Order in track (optional, defaults to 0)
 * @returns {Promise<Object>} Created task
 */
export async function createTask(trackId, data) {
  const {
    name,
    description = null,
    ownerRole = null,
    dueDaysOffset = null,
    order = 0,
  } = data;

  // Validate required fields
  if (!name) throw new Error('name is required');

  // Verify track exists
  const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
  if (!track) {
    throw new Error('Track not found');
  }

  // Create task
  const task = await db.taskTemplate.create({
    data: {
      trackId,
      name,
      description,
      ownerRole,
      dueDaysOffset: dueDaysOffset !== null ? parseInt(dueDaysOffset, 10) : null,
      order: parseInt(order, 10),
    },
  });

  return task;
}

/**
 * Update a task template
 * @param {string} trackId - Track ID
 * @param {string} taskId - Task ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated task
 */
export async function updateTask(trackId, taskId, data) {
  // Verify track exists
  const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
  if (!track) {
    throw new Error('Track not found');
  }

  // Verify task exists and belongs to track
  const existing = await db.taskTemplate.findUnique({ where: { id: taskId } });
  if (!existing || existing.trackId !== trackId) {
    throw new Error('Task not found');
  }

  // Build update object
  const updateData = {};
  for (const key of Object.keys(data)) {
    if (key === 'trackId') {
      // Skip trackId updates
      continue;
    }
    if (key === 'dueDaysOffset' || key === 'order') {
      updateData[key] = data[key] !== null ? parseInt(data[key], 10) : null;
    } else {
      updateData[key] = data[key];
    }
  }

  // Update task
  const updated = await db.taskTemplate.update({
    where: { id: taskId },
    data: updateData,
  });

  return updated;
}

/**
 * Delete a task template
 * @param {string} trackId - Track ID
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 */
export async function deleteTask(trackId, taskId) {
  // Verify track exists
  const track = await db.trackTemplate.findUnique({ where: { id: trackId } });
  if (!track) {
    throw new Error('Track not found');
  }

  // Verify task exists and belongs to track
  const existing = await db.taskTemplate.findUnique({ where: { id: taskId } });
  if (!existing || existing.trackId !== trackId) {
    throw new Error('Task not found');
  }

  // Check if task has instances - this might affect deletion
  const instances = await db.taskInstance.findMany({
    where: { taskTemplateId: taskId },
  });

  // If instances exist, we might want to prevent deletion or handle it gracefully
  // For now, we'll allow deletion but cascade should handle task instances
  if (instances.length > 0) {
    throw new Error('Cannot delete task template that has instances');
  }

  // Delete task
  await db.taskTemplate.delete({ where: { id: taskId } });
}
