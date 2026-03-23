import { db } from '../db.js';

/**
 * Custom Field Service
 * Handles CRUD operations for custom fields and their values
 * Validates field names, types, and values
 */

// Valid field types
const VALID_TYPES = ['text', 'select', 'date', 'checkbox', 'number'];

// Valid entity types
const VALID_ENTITY_TYPES = ['candidate', 'employee', 'device'];

/**
 * Validate field name is snake_case
 */
function isValidFieldName(name) {
  return /^[a-z0-9_]+$/.test(name) && !name.startsWith('_') && !name.endsWith('_');
}

/**
 * Create a custom field
 * @param {Object} data - Field data
 * @returns {Promise<Object>} Created field
 */
export async function createCustomField(data) {
  const { name, label, type, entityType, options, required, regex, order } = data;

  // Validate required fields
  if (!name) throw new Error('Field name is required');
  if (!label) throw new Error('Label is required');
  if (!type) throw new Error('Type is required');
  if (!entityType) throw new Error('Entity type is required');

  // Validate type
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Validate entity type
  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Entity type must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }

  // Validate field name format
  if (!isValidFieldName(name)) {
    throw new Error('Field name must be lowercase alphanumeric with underscores (snake_case)');
  }

  // Validate options for select type
  if (type === 'select') {
    if (!options) {
      throw new Error('Options are required for select type');
    }
    try {
      JSON.parse(options);
    } catch (e) {
      throw new Error('Options must be valid JSON array');
    }
  }

  // Check for duplicate field name per entity type
  const existing = await db.customField.findFirst({
    where: {
      name,
      entityType,
    },
  });

  if (existing) {
    throw new Error(`Custom field "${name}" already exists for ${entityType}`);
  }

  // Create field
  const field = await db.customField.create({
    data: {
      name,
      label,
      type,
      entityType,
      options: options || null,
      required: required || false,
      regex: regex || null,
      order: order || 999,
      active: true,
    },
  });

  return field;
}

/**
 * Get custom field by ID
 * @param {string} id - Field ID
 * @returns {Promise<Object>} Field
 */
export async function getCustomField(id) {
  const field = await db.customField.findUnique({
    where: { id },
    include: {
      values: true,
    },
  });

  if (!field) {
    throw new Error('Custom field not found');
  }

  if (!field.active) {
    throw new Error('Custom field is inactive');
  }

  return field;
}

/**
 * List custom fields for an entity type
 * @param {string} entityType - Entity type (candidate, employee, device)
 * @returns {Promise<Array>} Fields ordered by order field
 */
export async function listCustomFields(entityType) {
  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Entity type must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }

  const fields = await db.customField.findMany({
    where: {
      entityType,
      active: true,
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      values: true,
    },
  });

  return fields;
}

/**
 * List all custom fields (no filtering)
 * @returns {Promise<Array>} All active fields
 */
export async function listAllCustomFields() {
  const fields = await db.customField.findMany({
    where: {
      active: true,
    },
    orderBy: [
      { entityType: 'asc' },
      { order: 'asc' },
    ],
    include: {
      values: true,
    },
  });

  return fields;
}

/**
 * Update custom field
 * Can only update: label, options, required, order
 * Cannot update: name, type, entityType
 * @param {string} id - Field ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated field
 */
export async function updateCustomField(id, data) {
  const { label, options, required, order } = data;

  // Prevent updating certain fields
  if (data.name || data.type || data.entityType) {
    throw new Error('Cannot update name, type, or entityType after creation');
  }

  const field = await db.customField.findUnique({
    where: { id },
  });

  if (!field) {
    throw new Error('Custom field not found');
  }

  // Validate options if provided
  if (options) {
    try {
      JSON.parse(options);
    } catch (e) {
      throw new Error('Options must be valid JSON array');
    }
  }

  // Update field
  const updated = await db.customField.update({
    where: { id },
    data: {
      ...(label && { label }),
      ...(options !== undefined && { options }),
      ...(required !== undefined && { required }),
      ...(order !== undefined && { order }),
    },
    include: {
      values: true,
    },
  });

  return updated;
}

/**
 * Soft delete custom field (set active=false)
 * @param {string} id - Field ID
 * @returns {Promise<Object>} Updated field
 */
export async function deleteCustomField(id) {
  const field = await db.customField.findUnique({
    where: { id },
  });

  if (!field) {
    throw new Error('Custom field not found');
  }

  const updated = await db.customField.update({
    where: { id },
    data: { active: false },
  });

  return updated;
}

/**
 * Get custom field value for an entity
 * @param {string} customFieldId - Field ID
 * @param {string} entityId - Entity ID (candidate/employee/device)
 * @param {string} entityType - Entity type
 * @returns {Promise<Object|null>} Field value or null
 */
export async function getCustomFieldValue(customFieldId, entityId, entityType) {
  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Entity type must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }

  const value = await db.customFieldValue.findUnique({
    where: {
      customFieldId_entityType_entityId: {
        customFieldId,
        entityType,
        entityId,
      },
    },
    include: {
      customField: true,
    },
  });

  return value || null;
}

/**
 * Get all custom field values for an entity
 * @param {string} entityId - Entity ID
 * @param {string} entityType - Entity type
 * @returns {Promise<Array>} Field values with field definitions
 */
export async function getCustomFieldValuesByEntity(entityId, entityType) {
  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Entity type must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }

  const values = await db.customFieldValue.findMany({
    where: {
      entityId,
      entityType,
    },
    include: {
      customField: true,
    },
    orderBy: {
      customField: {
        order: 'asc',
      },
    },
  });

  return values;
}

/**
 * Set or update custom field value for an entity
 * @param {string} customFieldId - Field ID
 * @param {string} entityId - Entity ID
 * @param {string} entityType - Entity type
 * @param {*} value - Field value (will be stringified)
 * @returns {Promise<Object>} Created or updated value
 */
export async function setCustomFieldValue(customFieldId, entityId, entityType, value) {
  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Entity type must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }

  // Get field to validate
  const field = await db.customField.findUnique({
    where: { id: customFieldId },
  });

  if (!field) {
    throw new Error('Custom field not found');
  }

  // Validate value
  validateFieldValue(field, value);

  // Convert value to JSON string
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  // Upsert value
  const fieldValue = await db.customFieldValue.upsert({
    where: {
      customFieldId_entityType_entityId: {
        customFieldId,
        entityType,
        entityId,
      },
    },
    update: {
      value: stringValue,
    },
    create: {
      customFieldId,
      entityId,
      entityType,
      value: stringValue,
    },
    include: {
      customField: true,
    },
  });

  return fieldValue;
}

/**
 * Validate a field value against field constraints
 * @param {Object} field - Field definition
 * @param {*} value - Value to validate
 */
export function validateFieldValue(field, value) {
  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    throw new Error(`Field "${field.label}" is required`);
  }

  // Skip validation if value is empty and not required
  if (!value && !field.required) {
    return;
  }

  // Type-specific validation
  switch (field.type) {
    case 'text':
      if (typeof value !== 'string') {
        throw new Error(`Field "${field.label}" must be a string`);
      }
      if (field.regex) {
        const regex = new RegExp(field.regex);
        if (!regex.test(value)) {
          throw new Error(`Field "${field.label}" does not match required format`);
        }
      }
      break;

    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Field "${field.label}" must be a number`);
      }
      break;

    case 'select':
      if (!field.options) {
        throw new Error(`Field "${field.label}" has no options defined`);
      }
      const options = JSON.parse(field.options);
      if (!options.includes(value)) {
        throw new Error(`Field "${field.label}" value must be one of: ${options.join(', ')}`);
      }
      break;

    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Field "${field.label}" must be a valid date`);
      }
      break;

    case 'checkbox':
      if (typeof value !== 'boolean') {
        throw new Error(`Field "${field.label}" must be a boolean`);
      }
      break;
  }
}

/**
 * Delete all custom field values for an entity
 * Useful when deleting an employee/candidate/device
 * @param {string} entityId - Entity ID
 * @param {string} entityType - Entity type
 */
export async function deleteCustomFieldValuesByEntity(entityId, entityType) {
  if (!VALID_ENTITY_TYPES.includes(entityType)) {
    throw new Error(`Entity type must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }

  await db.customFieldValue.deleteMany({
    where: {
      entityId,
      entityType,
    },
  });
}
