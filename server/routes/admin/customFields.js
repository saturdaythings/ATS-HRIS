import express from 'express';
import {
  createCustomField,
  getCustomField,
  listCustomFields,
  listAllCustomFields,
  updateCustomField,
  deleteCustomField,
  getCustomFieldValue,
  setCustomFieldValue,
  getCustomFieldValuesByEntity,
} from '../../services/customFieldService.js';

const router = express.Router();

/**
 * GET /api/admin/custom-fields
 * List all active custom fields
 */
router.get('/', async (req, res, next) => {
  try {
    const fields = await listAllCustomFields();
    res.json({ data: fields, error: null });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/custom-fields
 * Create a new custom field
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, label, type, entityType, options, required, regex, order } = req.body;

    // Validate required fields
    if (!name || !label || !type || !entityType) {
      return res.status(400).json({
        error: 'Missing required fields: name, label, type, entityType',
      });
    }

    const field = await createCustomField({
      name,
      label,
      type,
      entityType,
      options,
      required,
      regex,
      order,
    });

    res.status(201).json({ data: field, error: null });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/admin/custom-fields/:id
 * Get a specific custom field
 */
router.get('/:id', async (req, res, next) => {
  try {
    const field = await getCustomField(req.params.id);
    res.json({ data: field, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/admin/custom-fields/entity/:entityType
 * List custom fields for a specific entity type
 */
router.get('/entity/:entityType', async (req, res, next) => {
  try {
    const fields = await listCustomFields(req.params.entityType);
    res.json({ data: fields, error: null });
  } catch (error) {
    if (error.message.includes('Entity type must be')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/custom-fields/:id
 * Update a custom field
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const field = await updateCustomField(req.params.id, req.body);
    res.json({ data: field, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Cannot update')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /api/admin/custom-fields/:id
 * Soft delete a custom field (set active=false)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteCustomField(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/admin/custom-fields/:fieldId/values/:entityType/:entityId
 * Get a specific custom field value for an entity
 */
router.get('/:fieldId/values/:entityType/:entityId', async (req, res, next) => {
  try {
    const { fieldId, entityType, entityId } = req.params;
    const value = await getCustomFieldValue(fieldId, entityId, entityType);
    res.json({ data: value, error: null });
  } catch (error) {
    if (error.message.includes('Entity type must be')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/admin/custom-fields/values/:entityType/:entityId
 * Get all custom field values for an entity
 */
router.get('/values/:entityType/:entityId', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const values = await getCustomFieldValuesByEntity(entityId, entityType);
    res.json({ data: values, error: null });
  } catch (error) {
    if (error.message.includes('Entity type must be')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * POST /api/admin/custom-fields/:fieldId/values
 * Set or update a custom field value for an entity
 */
router.post('/:fieldId/values', async (req, res, next) => {
  try {
    const { entityType, entityId, value } = req.body;
    const { fieldId } = req.params;

    if (!entityType || !entityId) {
      return res.status(400).json({
        error: 'Missing required fields: entityType, entityId',
      });
    }

    const fieldValue = await setCustomFieldValue(fieldId, entityId, entityType, value);
    res.status(201).json({ data: fieldValue, error: null });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Entity type must be')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('required') || error.message.includes('must be')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
