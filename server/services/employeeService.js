import { db } from '../db.js';

/**
 * Create a new employee
 * @param {Object} data - Employee data
 * @returns {Promise<Object>} Created employee
 */
export async function createEmployee(data) {
  return await db.employee.create({
    data: {
      name: data.name,
      email: data.email,
      title: data.title,
      department: data.department || null,
      startDate: data.startDate || null,
      status: data.status || 'active',
      clientId: data.clientId || null,
      candidateId: data.candidateId || null,
    }
  });
}

/**
 * List employees with optional filters and sorting
 * @param {Object} filters - Filter and pagination options
 * @param {string} filters.department - Filter by department
 * @param {string} filters.status - Filter by status (active, offboarded)
 * @param {string} filters.sortBy - Sort field (name, startDate)
 * @param {number} filters.limit - Results per page
 * @param {number} filters.offset - Pagination offset
 * @returns {Promise<Object>} Paginated list of employees
 */
export async function listEmployees(filters = {}) {
  const {
    department,
    status,
    sortBy = 'name',
    limit = 25,
    offset = 0,
  } = filters;

  // Build where clause
  const where = {};
  if (department) {
    where.department = department;
  }
  if (status) {
    where.status = status;
  }

  // Build orderBy
  const orderBy = {};
  if (sortBy === 'startDate') {
    orderBy.startDate = 'asc';
  } else {
    orderBy.name = 'asc';
  }

  const [data, total] = await Promise.all([
    db.employee.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    }),
    db.employee.count({ where }),
  ]);

  return {
    data,
    total,
    limit,
    offset,
  };
}

/**
 * Get employee details with relationships
 * @param {string} id - Employee ID
 * @returns {Promise<Object|null>} Employee with assignments and onboarding runs
 */
export async function getEmployeeById(id) {
  return await db.employee.findUnique({
    where: { id },
    include: {
      assignments: {
        where: { returnedDate: null },
        include: { device: true },
      },
      onboardingRuns: {
        include: { track: true, tasks: true },
      },
      client: true,
      candidate: true,
    }
  });
}

/**
 * Update employee details
 * @param {string} id - Employee ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated employee
 */
export async function updateEmployee(id, data) {
  // Validate employee exists
  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new Error(`Employee ${id} not found`);
  }

  // Build update data (exclude email and candidateId which shouldn't change)
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;

  return await db.employee.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Soft delete employee by setting status to offboarded
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} Updated employee
 */
export async function deleteEmployee(id) {
  const employee = await db.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new Error(`Employee ${id} not found`);
  }

  return await db.employee.update({
    where: { id },
    data: { status: 'offboarded' },
  });
}
