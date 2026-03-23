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
  validateFieldValue,
} from '../../services/customFieldService.js';
import { db } from '../../db.js';

describe('CustomFieldService', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.customFieldValue.deleteMany({});
    await db.customField.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('createCustomField', () => {
    test('should create a text field', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      expect(field.id).toBeDefined();
      expect(field.name).toBe('test_field');
      expect(field.label).toBe('Test Field');
      expect(field.type).toBe('text');
      expect(field.entityType).toBe('employee');
      expect(field.active).toBe(true);
    });

    test('should create a select field with options', async () => {
      const options = JSON.stringify(['XS', 'S', 'M', 'L', 'XL']);
      const field = await createCustomField({
        name: 'tshirt_size',
        label: 'T-Shirt Size',
        type: 'select',
        entityType: 'employee',
        options,
      });

      expect(field.type).toBe('select');
      expect(field.options).toBe(options);
    });

    test('should create a date field', async () => {
      const field = await createCustomField({
        name: 'start_date',
        label: 'Start Date',
        type: 'date',
        entityType: 'employee',
      });

      expect(field.type).toBe('date');
    });

    test('should create a checkbox field', async () => {
      const field = await createCustomField({
        name: 'is_remote',
        label: 'Is Remote',
        type: 'checkbox',
        entityType: 'employee',
      });

      expect(field.type).toBe('checkbox');
    });

    test('should create a number field', async () => {
      const field = await createCustomField({
        name: 'salary',
        label: 'Salary',
        type: 'number',
        entityType: 'employee',
      });

      expect(field.type).toBe('number');
    });

    test('should require field name', async () => {
      await expect(
        createCustomField({
          label: 'Test',
          type: 'text',
          entityType: 'employee',
        })
      ).rejects.toThrow('Field name is required');
    });

    test('should require label', async () => {
      await expect(
        createCustomField({
          name: 'test',
          type: 'text',
          entityType: 'employee',
        })
      ).rejects.toThrow('Label is required');
    });

    test('should require type', async () => {
      await expect(
        createCustomField({
          name: 'test',
          label: 'Test',
          entityType: 'employee',
        })
      ).rejects.toThrow('Type is required');
    });

    test('should require entityType', async () => {
      await expect(
        createCustomField({
          name: 'test',
          label: 'Test',
          type: 'text',
        })
      ).rejects.toThrow('Entity type is required');
    });

    test('should validate type is one of valid types', async () => {
      await expect(
        createCustomField({
          name: 'test',
          label: 'Test',
          type: 'invalid_type',
          entityType: 'employee',
        })
      ).rejects.toThrow('Type must be one of');
    });

    test('should validate entityType is one of valid types', async () => {
      await expect(
        createCustomField({
          name: 'test',
          label: 'Test',
          type: 'text',
          entityType: 'invalid_type',
        })
      ).rejects.toThrow('Entity type must be one of');
    });

    test('should validate field name is snake_case', async () => {
      await expect(
        createCustomField({
          name: 'TestField',
          label: 'Test',
          type: 'text',
          entityType: 'employee',
        })
      ).rejects.toThrow('Field name must be lowercase alphanumeric');
    });

    test('should validate field name does not start with underscore', async () => {
      await expect(
        createCustomField({
          name: '_test_field',
          label: 'Test',
          type: 'text',
          entityType: 'employee',
        })
      ).rejects.toThrow('Field name must be lowercase alphanumeric');
    });

    test('should validate field name does not end with underscore', async () => {
      await expect(
        createCustomField({
          name: 'test_field_',
          label: 'Test',
          type: 'text',
          entityType: 'employee',
        })
      ).rejects.toThrow('Field name must be lowercase alphanumeric');
    });

    test('should require options for select type', async () => {
      await expect(
        createCustomField({
          name: 'test_select',
          label: 'Test Select',
          type: 'select',
          entityType: 'employee',
        })
      ).rejects.toThrow('Options are required for select type');
    });

    test('should validate options is valid JSON', async () => {
      await expect(
        createCustomField({
          name: 'test_select',
          label: 'Test Select',
          type: 'select',
          entityType: 'employee',
          options: 'invalid json',
        })
      ).rejects.toThrow('Options must be valid JSON array');
    });

    test('should enforce unique field name per entityType', async () => {
      await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await expect(
        createCustomField({
          name: 'test_field',
          label: 'Test Field 2',
          type: 'text',
          entityType: 'employee',
        })
      ).rejects.toThrow('already exists');
    });

    test('should allow same name for different entityTypes', async () => {
      await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'candidate',
      });

      expect(field.entityType).toBe('candidate');
    });

    test('should set default order to 999', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      expect(field.order).toBe(999);
    });

    test('should accept custom order', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
        order: 10,
      });

      expect(field.order).toBe(10);
    });
  });

  describe('getCustomField', () => {
    test('should return field by id', async () => {
      const created = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      const found = await getCustomField(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe('test_field');
    });

    test('should throw if field not found', async () => {
      await expect(getCustomField('nonexistent_id')).rejects.toThrow('not found');
    });

    test('should throw if field is inactive', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await db.customField.update({
        where: { id: field.id },
        data: { active: false },
      });

      await expect(getCustomField(field.id)).rejects.toThrow('inactive');
    });
  });

  describe('listCustomFields', () => {
    test('should list fields for entity type ordered by order field', async () => {
      await createCustomField({
        name: 'field_a',
        label: 'Field A',
        type: 'text',
        entityType: 'employee',
        order: 2,
      });

      await createCustomField({
        name: 'field_b',
        label: 'Field B',
        type: 'text',
        entityType: 'employee',
        order: 1,
      });

      const fields = await listCustomFields('employee');

      expect(fields).toHaveLength(2);
      expect(fields[0].name).toBe('field_b');
      expect(fields[1].name).toBe('field_a');
    });

    test('should not include inactive fields', async () => {
      const field1 = await createCustomField({
        name: 'field_a',
        label: 'Field A',
        type: 'text',
        entityType: 'employee',
      });

      await createCustomField({
        name: 'field_b',
        label: 'Field B',
        type: 'text',
        entityType: 'employee',
      });

      await db.customField.update({
        where: { id: field1.id },
        data: { active: false },
      });

      const fields = await listCustomFields('employee');

      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe('field_b');
    });

    test('should validate entityType', async () => {
      await expect(listCustomFields('invalid')).rejects.toThrow('Entity type must be one of');
    });

    test('should return empty array if no fields', async () => {
      const fields = await listCustomFields('employee');
      expect(fields).toEqual([]);
    });
  });

  describe('listAllCustomFields', () => {
    test('should list all active fields regardless of entityType', async () => {
      await createCustomField({
        name: 'field_a',
        label: 'Field A',
        type: 'text',
        entityType: 'employee',
      });

      await createCustomField({
        name: 'field_b',
        label: 'Field B',
        type: 'text',
        entityType: 'candidate',
      });

      const fields = await listAllCustomFields();

      expect(fields).toHaveLength(2);
    });
  });

  describe('updateCustomField', () => {
    test('should update label', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      const updated = await updateCustomField(field.id, {
        label: 'Updated Label',
      });

      expect(updated.label).toBe('Updated Label');
    });

    test('should update options', async () => {
      const field = await createCustomField({
        name: 'test_select',
        label: 'Test Select',
        type: 'select',
        entityType: 'employee',
        options: JSON.stringify(['A', 'B']),
      });

      const newOptions = JSON.stringify(['X', 'Y', 'Z']);
      const updated = await updateCustomField(field.id, {
        options: newOptions,
      });

      expect(updated.options).toBe(newOptions);
    });

    test('should update required flag', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
        required: false,
      });

      const updated = await updateCustomField(field.id, {
        required: true,
      });

      expect(updated.required).toBe(true);
    });

    test('should update order', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
        order: 10,
      });

      const updated = await updateCustomField(field.id, {
        order: 5,
      });

      expect(updated.order).toBe(5);
    });

    test('should prevent updating name', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await expect(
        updateCustomField(field.id, {
          name: 'new_name',
        })
      ).rejects.toThrow('Cannot update');
    });

    test('should prevent updating type', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await expect(
        updateCustomField(field.id, {
          type: 'select',
        })
      ).rejects.toThrow('Cannot update');
    });

    test('should prevent updating entityType', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await expect(
        updateCustomField(field.id, {
          entityType: 'candidate',
        })
      ).rejects.toThrow('Cannot update');
    });

    test('should throw if field not found', async () => {
      await expect(
        updateCustomField('nonexistent_id', { label: 'New Label' })
      ).rejects.toThrow('not found');
    });

    test('should validate options is valid JSON', async () => {
      const field = await createCustomField({
        name: 'test_select',
        label: 'Test Select',
        type: 'select',
        entityType: 'employee',
        options: JSON.stringify(['A', 'B']),
      });

      await expect(
        updateCustomField(field.id, {
          options: 'invalid json',
        })
      ).rejects.toThrow('Options must be valid JSON array');
    });
  });

  describe('deleteCustomField', () => {
    test('should soft-delete field by setting active=false', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      const deleted = await deleteCustomField(field.id);

      expect(deleted.active).toBe(false);
    });

    test('should throw if field not found', async () => {
      await expect(deleteCustomField('nonexistent_id')).rejects.toThrow('not found');
    });
  });

  describe('setCustomFieldValue', () => {
    test('should create field value', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      const value = await setCustomFieldValue(field.id, 'emp123', 'employee', 'test value');

      expect(value.value).toBe('test value');
      expect(value.entityId).toBe('emp123');
      expect(value.entityType).toBe('employee');
      expect(value.customFieldId).toBe(field.id);
    });

    test('should update existing field value', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await setCustomFieldValue(field.id, 'emp123', 'employee', 'value1');
      const updated = await setCustomFieldValue(field.id, 'emp123', 'employee', 'value2');

      expect(updated.value).toBe('value2');
    });

    test('should validate field value against field constraints', async () => {
      const field = await createCustomField({
        name: 'test_select',
        label: 'Test Select',
        type: 'select',
        entityType: 'employee',
        options: JSON.stringify(['A', 'B', 'C']),
      });

      await expect(
        setCustomFieldValue(field.id, 'emp123', 'employee', 'D')
      ).rejects.toThrow('must be one of');
    });

    test('should throw if field not found', async () => {
      await expect(
        setCustomFieldValue('nonexistent', 'emp123', 'employee', 'value')
      ).rejects.toThrow('not found');
    });

    test('should validate entityType', async () => {
      const field = await createCustomField({
        name: 'test_field',
        label: 'Test Field',
        type: 'text',
        entityType: 'employee',
      });

      await expect(
        setCustomFieldValue(field.id, 'emp123', 'invalid', 'value')
      ).rejects.toThrow('Entity type must be one of');
    });
  });

  describe('getCustomFieldValuesByEntity', () => {
    test('should return all field values for an entity', async () => {
      const field1 = await createCustomField({
        name: 'field1',
        label: 'Field 1',
        type: 'text',
        entityType: 'employee',
        order: 1,
      });

      const field2 = await createCustomField({
        name: 'field2',
        label: 'Field 2',
        type: 'text',
        entityType: 'employee',
        order: 2,
      });

      await setCustomFieldValue(field1.id, 'emp123', 'employee', 'value1');
      await setCustomFieldValue(field2.id, 'emp123', 'employee', 'value2');

      const values = await getCustomFieldValuesByEntity('emp123', 'employee');

      expect(values).toHaveLength(2);
      expect(values[0].customField.name).toBe('field1');
      expect(values[1].customField.name).toBe('field2');
    });

    test('should return empty array if no values', async () => {
      const values = await getCustomFieldValuesByEntity('emp999', 'employee');
      expect(values).toEqual([]);
    });

    test('should validate entityType', async () => {
      await expect(
        getCustomFieldValuesByEntity('emp123', 'invalid')
      ).rejects.toThrow('Entity type must be one of');
    });
  });

  describe('validateFieldValue', () => {
    test('should validate text field', async () => {
      const field = {
        type: 'text',
        label: 'Test',
        required: false,
      };

      expect(() => validateFieldValue(field, 'text value')).not.toThrow();
    });

    test('should enforce required text field', async () => {
      const field = {
        type: 'text',
        label: 'Test',
        required: true,
      };

      expect(() => validateFieldValue(field, '')).toThrow('required');
    });

    test('should validate number field', async () => {
      const field = {
        type: 'number',
        label: 'Test',
        required: false,
      };

      expect(() => validateFieldValue(field, 42)).not.toThrow();
      expect(() => validateFieldValue(field, 'not a number')).toThrow('must be a number');
    });

    test('should validate select field', async () => {
      const field = {
        type: 'select',
        label: 'Test',
        required: false,
        options: JSON.stringify(['A', 'B', 'C']),
      };

      expect(() => validateFieldValue(field, 'A')).not.toThrow();
      expect(() => validateFieldValue(field, 'D')).toThrow('must be one of');
    });

    test('should validate date field', async () => {
      const field = {
        type: 'date',
        label: 'Test',
        required: false,
      };

      expect(() => validateFieldValue(field, '2026-03-23')).not.toThrow();
      expect(() => validateFieldValue(field, 'invalid date')).toThrow('valid date');
    });

    test('should validate checkbox field', async () => {
      const field = {
        type: 'checkbox',
        label: 'Test',
        required: false,
      };

      expect(() => validateFieldValue(field, true)).not.toThrow();
      expect(() => validateFieldValue(field, 'true')).toThrow('must be a boolean');
    });

    test('should validate text field with regex', async () => {
      const field = {
        type: 'text',
        label: 'Test',
        required: false,
        regex: '^[A-Z]+$',
      };

      expect(() => validateFieldValue(field, 'ABC')).not.toThrow();
      expect(() => validateFieldValue(field, 'abc')).toThrow('does not match required format');
    });

    test('should allow empty value if not required', async () => {
      const field = {
        type: 'text',
        label: 'Test',
        required: false,
      };

      expect(() => validateFieldValue(field, '')).not.toThrow();
      expect(() => validateFieldValue(field, null)).not.toThrow();
    });
  });
});
