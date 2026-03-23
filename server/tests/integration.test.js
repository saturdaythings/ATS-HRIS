/**
 * Integration test for Custom Field Service
 * Run with: node server/tests/integration.test.js
 */

import {
  createCustomField,
  getCustomField,
  listCustomFields,
  listAllCustomFields,
  updateCustomField,
  deleteCustomField,
  setCustomFieldValue,
  getCustomFieldValuesByEntity,
  validateFieldValue,
} from '../services/customFieldService.js';
import { db } from '../db.js';

let passCount = 0;
let failCount = 0;

async function cleanup() {
  await db.customFieldValue.deleteMany({});
  await db.customField.deleteMany({});
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passCount++;
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    failCount++;
  }
}

async function assertEquals(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
  }
}

async function assertThrows(fn, expectedMessage) {
  try {
    await fn();
    throw new Error(`Expected to throw "${expectedMessage}", but did not throw`);
  } catch (error) {
    if (!error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error to include "${expectedMessage}", but got "${error.message}"`
      );
    }
  }
}

async function main() {
  console.log('\n=== Custom Field Service Integration Tests ===\n');

  // Test: Create text field
  await test('should create a text field', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    if (!field.id || field.name !== 'test_field') {
      throw new Error('Field not created correctly');
    }
  });

  // Test: Create select field
  await test('should create a select field with options', async () => {
    await cleanup();
    const options = JSON.stringify(['XS', 'S', 'M', 'L', 'XL']);
    const field = await createCustomField({
      name: 'tshirt_size',
      label: 'T-Shirt Size',
      type: 'select',
      entityType: 'employee',
      options,
    });
    if (field.type !== 'select' || field.options !== options) {
      throw new Error('Select field not created correctly');
    }
  });

  // Test: Validate required fields
  await test('should require field name', async () => {
    await cleanup();
    await assertThrows(
      () =>
        createCustomField({
          label: 'Test',
          type: 'text',
          entityType: 'employee',
        }),
      'Field name is required'
    );
  });

  // Test: Validate type
  await test('should validate type is one of valid types', async () => {
    await cleanup();
    await assertThrows(
      () =>
        createCustomField({
          name: 'test',
          label: 'Test',
          type: 'invalid_type',
          entityType: 'employee',
        }),
      'Type must be one of'
    );
  });

  // Test: Validate snake_case
  await test('should validate field name is snake_case', async () => {
    await cleanup();
    await assertThrows(
      () =>
        createCustomField({
          name: 'TestField',
          label: 'Test',
          type: 'text',
          entityType: 'employee',
        }),
      'Field name must be lowercase alphanumeric'
    );
  });

  // Test: Unique constraint
  await test('should enforce unique field name per entityType', async () => {
    await cleanup();
    await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    await assertThrows(
      () =>
        createCustomField({
          name: 'test_field',
          label: 'Test Field 2',
          type: 'text',
          entityType: 'employee',
        }),
      'already exists'
    );
  });

  // Test: Allow same name for different entity types
  await test('should allow same name for different entityTypes', async () => {
    await cleanup();
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
    if (field.entityType !== 'candidate') {
      throw new Error('Field created for wrong entity type');
    }
  });

  // Test: Get field by ID
  await test('should return field by id', async () => {
    await cleanup();
    const created = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const found = await getCustomField(created.id);
    if (found.id !== created.id) {
      throw new Error('Retrieved field does not match');
    }
  });

  // Test: List fields for entity type
  await test('should list fields for entity type ordered by order field', async () => {
    await cleanup();
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
    if (fields.length !== 2 || fields[0].name !== 'field_b' || fields[1].name !== 'field_a') {
      throw new Error('Fields not ordered correctly');
    }
  });

  // Test: Update field label
  await test('should update field label', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const updated = await updateCustomField(field.id, {
      label: 'Updated Label',
    });
    if (updated.label !== 'Updated Label') {
      throw new Error('Label not updated');
    }
  });

  // Test: Prevent updating name
  await test('should prevent updating name', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    await assertThrows(
      () => updateCustomField(field.id, { name: 'new_name' }),
      'Cannot update'
    );
  });

  // Test: Soft delete
  await test('should soft-delete field by setting active=false', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const deleted = await deleteCustomField(field.id);
    if (deleted.active !== false) {
      throw new Error('Field not soft-deleted');
    }
  });

  // Test: Set field value
  await test('should create field value', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const value = await setCustomFieldValue(field.id, 'emp123', 'employee', 'test value');
    if (value.value !== 'test value' || value.entityId !== 'emp123') {
      throw new Error('Field value not created correctly');
    }
  });

  // Test: Update field value
  await test('should update existing field value', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    await setCustomFieldValue(field.id, 'emp123', 'employee', 'value1');
    const updated = await setCustomFieldValue(field.id, 'emp123', 'employee', 'value2');
    if (updated.value !== 'value2') {
      throw new Error('Field value not updated');
    }
  });

  // Test: Get field values for entity
  await test('should return all field values for an entity', async () => {
    await cleanup();
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
    if (values.length !== 2 || values[0].customField.name !== 'field1') {
      throw new Error('Field values not retrieved correctly');
    }
  });

  // Test: Validate text field
  await test('should validate text field', async () => {
    const field = {
      type: 'text',
      label: 'Test',
      required: false,
    };
    validateFieldValue(field, 'text value');
  });

  // Test: Validate required text field
  await test('should enforce required text field', async () => {
    const field = {
      type: 'text',
      label: 'Test',
      required: true,
    };
    await assertThrows(() => validateFieldValue(field, ''), 'required');
  });

  // Test: Validate number field
  await test('should validate number field', async () => {
    const field = {
      type: 'number',
      label: 'Test',
      required: false,
    };
    validateFieldValue(field, 42);
  });

  // Test: Validate select field
  await test('should validate select field', async () => {
    const field = {
      type: 'select',
      label: 'Test',
      required: false,
      options: JSON.stringify(['A', 'B', 'C']),
    };
    validateFieldValue(field, 'A');
    await assertThrows(() => validateFieldValue(field, 'D'), 'must be one of');
  });

  // Test: Validate date field
  await test('should validate date field', async () => {
    const field = {
      type: 'date',
      label: 'Test',
      required: false,
    };
    validateFieldValue(field, '2026-03-23');
    await assertThrows(() => validateFieldValue(field, 'invalid date'), 'valid date');
  });

  // Test: Validate checkbox field
  await test('should validate checkbox field', async () => {
    const field = {
      type: 'checkbox',
      label: 'Test',
      required: false,
    };
    validateFieldValue(field, true);
    await assertThrows(() => validateFieldValue(field, 'true'), 'must be a boolean');
  });

  // Test: Validate with regex
  await test('should validate text field with regex', async () => {
    const field = {
      type: 'text',
      label: 'Test',
      required: false,
      regex: '^[A-Z]+$',
    };
    validateFieldValue(field, 'ABC');
    await assertThrows(() => validateFieldValue(field, 'abc'), 'does not match required format');
  });

  // Test: List all fields
  await test('should list all active fields', async () => {
    await cleanup();
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
    if (fields.length !== 2) {
      throw new Error('All fields not listed');
    }
  });

  console.log(`\n=== Results ===`);
  console.log(`✓ Passed: ${passCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`Total: ${passCount + failCount}`);

  await cleanup();
  await db.$disconnect();

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
