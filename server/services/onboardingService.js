import { db } from '../db.js';

/**
 * Onboarding Service
 * Handles CRUD operations for onboarding templates and checklists
 * Templates define role-based onboarding tasks
 * Checklists are instances assigned to employees
 */

/**
 * Create an onboarding template
 * @param {Object} data - Template data { name, role, items[] }
 * @returns {Promise<Object>} Created template with items
 */
export async function createTemplate(data) {
  const { name, role, items = [] } = data;

  // Validate required fields
  if (!name) throw new Error('Template name is required');
  if (!role) throw new Error('Role is required');

  // Validate items
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item.task) throw new Error('Task is required for all items');
      if (!item.assignedTo) throw new Error('Assigned to is required for all items');
      if (item.daysUntilDue === undefined || item.daysUntilDue === null) {
        throw new Error('Days until due is required for all items');
      }
      if (item.daysUntilDue <= 0) {
        throw new Error('Days until due must be positive');
      }
    }
  }

  // Create template with items in transaction
  const template = await db.onboardingTemplate.create({
    data: {
      name,
      role,
      items: {
        create: items.map((item) => ({
          task: item.task,
          assignedTo: item.assignedTo,
          dueDate: new Date(Date.now() + item.daysUntilDue * 24 * 60 * 60 * 1000),
        })),
      },
    },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return template;
}

/**
 * Get template by ID
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Template with items
 */
export async function getTemplate(id) {
  const template = await db.onboardingTemplate.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!template) {
    throw new Error(`Template not found`);
  }

  return template;
}

/**
 * List all templates, optionally filtered by role
 * @param {Object} filters - Filter options { role }
 * @returns {Promise<Array>} Templates with items
 */
export async function listTemplates(filters = {}) {
  const { role } = filters;

  const templates = await db.onboardingTemplate.findMany({
    where: role ? { role } : {},
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return templates;
}

/**
 * Update an onboarding template
 * @param {string} id - Template ID
 * @param {Object} data - Update data { name, role, items }
 * @returns {Promise<Object>} Updated template
 */
export async function updateTemplate(id, data) {
  const { name, role, items } = data;

  // Verify template exists
  const existing = await db.onboardingTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Template not found`);
  }

  // Validate items if provided
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item.task) throw new Error('Task is required for all items');
      if (!item.assignedTo) throw new Error('Assigned to is required for all items');
      if (item.daysUntilDue === undefined || item.daysUntilDue === null) {
        throw new Error('Days until due is required for all items');
      }
      if (item.daysUntilDue <= 0) {
        throw new Error('Days until due must be positive');
      }
    }
  }

  // Update template
  const updated = await db.onboardingTemplate.update({
    where: { id },
    data: {
      name: name !== undefined ? name : existing.name,
      role: role !== undefined ? role : existing.role,
      items: Array.isArray(items)
        ? {
            deleteMany: {},
            create: items.map((item) => ({
              task: item.task,
              assignedTo: item.assignedTo,
              dueDate: new Date(
                Date.now() + item.daysUntilDue * 24 * 60 * 60 * 1000
              ),
            })),
          }
        : undefined,
    },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return updated;
}

/**
 * Delete (soft) an onboarding template
 * @param {string} id - Template ID
 */
export async function deleteTemplate(id) {
  const existing = await db.onboardingTemplate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Template not found`);
  }

  // Delete template (cascade will delete items and checklists)
  await db.onboardingTemplate.delete({
    where: { id },
  });
}

/**
 * Create a checklist from a template for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Created checklist with items
 */
export async function createChecklistFromTemplate(employeeId, templateId) {
  // Verify employee exists
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get template with items
  const template = await db.onboardingTemplate.findUnique({
    where: { id: templateId },
    include: {
      items: true,
    },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Create checklist with items from template
  const checklist = await db.onboardingChecklist.create({
    data: {
      employeeId,
      templateId,
      status: 'active',
      items: {
        create: template.items.map((item) => ({
          task: item.task,
          assignedTo: item.assignedTo,
          dueDate: item.dueDate,
          completed: false,
        })),
      },
    },
    include: {
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return checklist;
}

/**
 * Get a checklist by ID
 * @param {string} id - Checklist ID
 * @returns {Promise<Object>} Checklist with items
 */
export async function getChecklist(id) {
  const checklist = await db.onboardingChecklist.findUnique({
    where: { id },
    include: {
      employee: true,
      template: true,
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!checklist) {
    throw new Error(`Checklist "${id}" not found`);
  }

  return checklist;
}

/**
 * List all checklists for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Array>} Checklists
 */
export async function listChecklistsByEmployee(employeeId) {
  // Verify employee exists
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  const checklists = await db.onboardingChecklist.findMany({
    where: { employeeId },
    include: {
      template: true,
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return checklists;
}

/**
 * Get progress for a checklist
 * @param {string} checklistId - Checklist ID
 * @returns {Promise<Object>} Progress { total, completed, percentage }
 */
export async function getChecklistProgress(checklistId) {
  const checklist = await getChecklist(checklistId);

  const total = checklist.items.length;
  const completed = checklist.items.filter((item) => item.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percentage,
  };
}

/**
 * Mark a checklist item as complete
 * @param {string} itemId - Item ID
 * @param {string} completedBy - User/email who completed it
 * @returns {Promise<Object>} Updated item
 */
export async function markItemComplete(itemId, completedBy) {
  if (!completedBy) {
    throw new Error('completedBy is required');
  }

  const existing = await db.onboardingChecklistItem.findUnique({
    where: { id: itemId },
  });

  if (!existing) {
    throw new Error(`Item "${itemId}" not found`);
  }

  const updated = await db.onboardingChecklistItem.update({
    where: { id: itemId },
    data: {
      completed: true,
      completedAt: new Date(),
      completedBy,
    },
  });

  return updated;
}
