import { db } from '../db.js';

/**
 * Device Service
 * Handles device CRUD, assignment, return, and history management
 */

/**
 * Create a new device
 * @param {Object} data - Device data
 * @returns {Promise<Object>} Created device
 */
export async function createDevice(data) {
  return await db.device.create({
    data: {
      serial: data.serial,
      type: data.type,
      make: data.make,
      model: data.model,
      condition: data.condition || 'good',
      status: data.status || 'available',
      warrantyExp: data.warrantyExp || null,
      notes: data.notes || null,
    }
  });
}

/**
 * Assign a device to an employee
 * @param {Object} data - Assignment data
 * @param {string} data.deviceId - Device ID (required)
 * @param {string} data.employeeId - Employee ID (required)
 * @param {Date} data.assignedDate - Assignment date (optional, defaults to now)
 * @param {string} data.notes - Assignment notes (optional)
 * @returns {Promise<Object>} Created assignment
 * @throws {Error} If device/employee not found or device already assigned
 */
export async function assignDevice(data) {
  const {
    deviceId,
    employeeId,
    assignedDate = new Date(),
    notes = null,
  } = data;

  // Validate required fields
  if (!deviceId) throw new Error('deviceId is required');
  if (!employeeId) throw new Error('employeeId is required');

  // Verify device exists
  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    throw new Error('Device not found');
  }

  // Verify employee exists
  const employee = await db.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check if device already has an active assignment
  const activeAssignment = await db.deviceAssignment.findFirst({
    where: {
      deviceId,
      returnedDate: null,
    },
  });

  if (activeAssignment) {
    throw new Error('Device is already assigned');
  }

  // Create assignment
  const assignment = await db.deviceAssignment.create({
    data: {
      deviceId,
      employeeId,
      assignedDate: new Date(assignedDate),
      notes,
    },
  });

  // Update device status to assigned
  await db.device.update({
    where: { id: deviceId },
    data: { status: 'assigned' },
  });

  return assignment;
}

/**
 * Return a device from an employee
 * @param {Object} data - Return data
 * @param {string} data.deviceId - Device ID (required)
 * @param {Date} data.returnedDate - Return date (required)
 * @param {string} data.condition - Device condition: new, good, fair, poor (optional)
 * @param {string} data.notes - Return notes (optional)
 * @returns {Promise<Object>} Updated assignment
 * @throws {Error} If device not found or has no active assignment
 */
export async function returnDevice(data) {
  const {
    deviceId,
    returnedDate,
    condition = null,
    notes = null,
  } = data;

  // Validate required fields
  if (!deviceId) throw new Error('deviceId is required');
  if (!returnedDate) throw new Error('returnedDate is required');

  // Verify device exists
  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    throw new Error('Device not found');
  }

  // Find active assignment
  const activeAssignment = await db.deviceAssignment.findFirst({
    where: {
      deviceId,
      returnedDate: null,
    },
  });

  if (!activeAssignment) {
    throw new Error('Device has no active assignment');
  }

  // Update assignment with return info
  const updated = await db.deviceAssignment.update({
    where: { id: activeAssignment.id },
    data: {
      returnedDate: new Date(returnedDate),
      condition,
      notes,
    },
  });

  // Update device status to available and condition if provided
  await db.device.update({
    where: { id: deviceId },
    data: {
      status: 'available',
      ...(condition && { condition }),
    },
  });

  return updated;
}

/**
 * Get assignment history for a device
 * @param {string} deviceId - Device ID
 * @returns {Promise<Array>} List of assignments with employee and device details
 * @throws {Error} If device not found
 */
export async function getAssignmentHistory(deviceId) {
  // Verify device exists
  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    throw new Error('Device not found');
  }

  const assignments = await db.deviceAssignment.findMany({
    where: { deviceId },
    include: {
      device: true,
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          title: true,
          department: true,
        },
      },
    },
    orderBy: { assignedDate: 'desc' },
  });

  return assignments;
}

/**
 * Get all devices assigned to an employee (current and past)
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Array>} Devices with full assignment history
 * @throws {Error} If employee not found
 */
export async function getEmployeeDevices(employeeId) {
  // Verify employee exists
  const employee = await db.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get all devices assigned to this employee
  const assignments = await db.deviceAssignment.findMany({
    where: { employeeId },
    include: {
      device: true,
    },
    orderBy: { assignedDate: 'desc' },
  });

  // Group by device and build result with full assignment history
  const deviceMap = new Map();

  for (const assignment of assignments) {
    const deviceId = assignment.deviceId;

    if (!deviceMap.has(deviceId)) {
      deviceMap.set(deviceId, {
        id: assignment.device.id,
        serial: assignment.device.serial,
        type: assignment.device.type,
        make: assignment.device.make,
        model: assignment.device.model,
        condition: assignment.device.condition,
        status: assignment.device.status,
        warrantyExp: assignment.device.warrantyExp,
        notes: assignment.device.notes,
        createdAt: assignment.device.createdAt,
        updatedAt: assignment.device.updatedAt,
        assignments: [],
      });
    }

    deviceMap.get(deviceId).assignments.push(assignment);
  }

  return Array.from(deviceMap.values());
}

/**
 * Get all devices with optional filtering
 * @param {Object} filters - Filter options
 * @param {string} filters.type - Device type (laptop, monitor, phone, peripheral)
 * @param {string} filters.status - Device status (available, assigned, retired)
 * @param {string} filters.condition - Device condition (new, good, fair, poor)
 * @param {number} filters.limit - Results limit (default: 25)
 * @param {number} filters.offset - Results offset (default: 0)
 * @returns {Promise<Object>} Paginated list of devices
 */
export async function listDevices(filters = {}) {
  const {
    type = null,
    status = null,
    condition = null,
    limit = 25,
    offset = 0,
  } = filters;

  const where = {};

  if (type) where.type = type;
  if (status) where.status = status;
  if (condition) where.condition = condition;

  const [data, total] = await Promise.all([
    db.device.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { serial: 'asc' },
    }),
    db.device.count({ where }),
  ]);

  return { data, total, limit, offset };
}

/**
 * Get device by ID with current assignment
 * @param {string} deviceId - Device ID
 * @returns {Promise<Object>} Device with current assignment details
 * @throws {Error} If device not found
 */
export async function getDeviceWithAssignment(deviceId) {
  const device = await db.device.findUnique({
    where: { id: deviceId },
    include: {
      assignments: {
        where: { returnedDate: null },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              title: true,
              department: true,
            },
          },
        },
      },
    },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  return device;
}

/**
 * Get device by ID with assignment history
 * @param {string} id - Device ID
 * @returns {Promise<Object|null>} Device with all assignments
 */
export async function getDeviceById(id) {
  return await db.device.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { employee: true },
        orderBy: { assignedDate: 'desc' },
      }
    }
  });
}

/**
 * Update device details
 * @param {string} id - Device ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated device
 */
export async function updateDevice(id, data) {
  // Validate device exists
  const device = await db.device.findUnique({ where: { id } });
  if (!device) {
    throw new Error(`Device ${id} not found`);
  }

  // Build update data (exclude serial which shouldn't change)
  const updateData = {};
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.warrantyExp !== undefined) updateData.warrantyExp = data.warrantyExp;

  return await db.device.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Soft delete device by setting status to retired
 * @param {string} id - Device ID
 * @returns {Promise<Object>} Updated device
 */
export async function deleteDevice(id) {
  const device = await db.device.findUnique({ where: { id } });
  if (!device) {
    throw new Error(`Device ${id} not found`);
  }

  return await db.device.update({
    where: { id },
    data: { status: 'retired' },
  });
}
