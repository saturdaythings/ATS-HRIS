#!/usr/bin/env node

/**
 * Verification Script for Custom Fields Implementation (Chunk-13)
 * Tests the custom field service and routes implementation
 */

import {
  createCustomField,
  getCustomField,
  listCustomFields,
  updateCustomField,
  deleteCustomField,
  setCustomFieldValue,
  getCustomFieldValuesByEntity,
  validateFieldValue,
} from './server/services/customFieldService.js';
import { db } from './server/db.js';

let passCount = 0;
let failCount = 0;

async function cleanup() {
  await db.customFieldValue.deleteMany({});
  await db.customField.deleteMany({});
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${error.message}`);
    failCount++;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      Custom Fields Service Implementation Verification      ║');
  console.log('║                    (Chunk-13)                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Testing Custom Field Service...\n');

  // === Field Creation Tests ===
  console.log('▸ Field Creation');
  await test('Create text field', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_text',
      label: 'Test Text',
      type: 'text',
      entityType: 'employee',
    });
    if (!field.id || field.type !== 'text') throw new Error('Failed to create text field');
  });

  await test('Create select field with options', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'tshirt_size',
      label: 'T-Shirt Size',
      type: 'select',
      entityType: 'employee',
      options: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    });
    if (field.type !== 'select') throw new Error('Failed to create select field');
  });

  await test('Create date field', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'start_date',
      label: 'Start Date',
      type: 'date',
      entityType: 'employee',
    });
    if (field.type !== 'date') throw new Error('Failed to create date field');
  });

  await test('Create checkbox field', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'is_remote',
      label: 'Is Remote',
      type: 'checkbox',
      entityType: 'employee',
    });
    if (field.type !== 'checkbox') throw new Error('Failed to create checkbox field');
  });

  await test('Create number field', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'salary',
      label: 'Salary',
      type: 'number',
      entityType: 'employee',
    });
    if (field.type !== 'number') throw new Error('Failed to create number field');
  });

  // === Validation Tests ===
  console.log('\n▸ Field Validation');
  await test('Require field name', async () => {
    await cleanup();
    try {
      await createCustomField({
        label: 'Test',
        type: 'text',
        entityType: 'employee',
      });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('name')) throw e;
    }
  });

  await test('Validate snake_case field names', async () => {
    await cleanup();
    try {
      await createCustomField({
        name: 'TestField',
        label: 'Test',
        type: 'text',
        entityType: 'employee',
      });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('snake_case')) throw e;
    }
  });

  await test('Enforce unique field name per entityType', async () => {
    await cleanup();
    await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    try {
      await createCustomField({
        name: 'test_field',
        label: 'Test 2',
        type: 'text',
        entityType: 'employee',
      });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
  });

  await test('Allow same name for different entityTypes', async () => {
    await cleanup();
    await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'candidate',
    });
    if (field.entityType !== 'candidate') throw new Error('Wrong entityType');
  });

  await test('Validate field type', async () => {
    await cleanup();
    try {
      await createCustomField({
        name: 'test',
        label: 'Test',
        type: 'invalid',
        entityType: 'employee',
      });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Type must be')) throw e;
    }
  });

  await test('Validate entityType', async () => {
    await cleanup();
    try {
      await createCustomField({
        name: 'test',
        label: 'Test',
        type: 'text',
        entityType: 'invalid',
      });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Entity type must be')) throw e;
    }
  });

  // === CRUD Tests ===
  console.log('\n▸ CRUD Operations');
  await test('Get field by ID', async () => {
    await cleanup();
    const created = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    const found = await getCustomField(created.id);
    if (found.id !== created.id) throw new Error('IDs do not match');
  });

  await test('List fields for entityType ordered by order field', async () => {
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
    if (fields[0].name !== 'field_b' || fields[1].name !== 'field_a') {
      throw new Error('Fields not ordered correctly');
    }
  });

  await test('Update field label', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Original',
      type: 'text',
      entityType: 'employee',
    });
    const updated = await updateCustomField(field.id, { label: 'Updated' });
    if (updated.label !== 'Updated') throw new Error('Label not updated');
  });

  await test('Prevent updating name after creation', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    try {
      await updateCustomField(field.id, { name: 'new_name' });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Cannot update')) throw e;
    }
  });

  await test('Prevent updating type after creation', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    try {
      await updateCustomField(field.id, { type: 'select' });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Cannot update')) throw e;
    }
  });

  await test('Soft-delete field (set active=false)', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    const deleted = await deleteCustomField(field.id);
    if (deleted.active !== false) throw new Error('Not marked as inactive');
  });

  // === Field Value Tests ===
  console.log('\n▸ Field Values');
  await test('Set field value for entity', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    const value = await setCustomFieldValue(field.id, 'emp123', 'employee', 'test value');
    if (value.value !== 'test value') throw new Error('Value not set');
  });

  await test('Update field value', async () => {
    await cleanup();
    const field = await createCustomField({
      name: 'test_field',
      label: 'Test',
      type: 'text',
      entityType: 'employee',
    });
    await setCustomFieldValue(field.id, 'emp123', 'employee', 'value1');
    const updated = await setCustomFieldValue(field.id, 'emp123', 'employee', 'value2');
    if (updated.value !== 'value2') throw new Error('Value not updated');
  });

  await test('Get all field values for entity', async () => {
    await cleanup();
    const field1 = await createCustomField({
      name: 'field1',
      label: 'Field 1',
      type: 'text',
      entityType: 'employee',
    });
    const field2 = await createCustomField({
      name: 'field2',
      label: 'Field 2',
      type: 'text',
      entityType: 'employee',
    });
    await setCustomFieldValue(field1.id, 'emp123', 'employee', 'value1');
    await setCustomFieldValue(field2.id, 'emp123', 'employee', 'value2');
    const values = await getCustomFieldValuesByEntity('emp123', 'employee');
    if (values.length !== 2) throw new Error('Wrong number of values');
  });

  // === Value Validation Tests ===
  console.log('\n▸ Value Validation');
  await test('Validate text field', async () => {
    const field = { type: 'text', label: 'Test', required: false };
    validateFieldValue(field, 'text value');
  });

  await test('Enforce required text field', async () => {
    const field = { type: 'text', label: 'Test', required: true };
    try {
      validateFieldValue(field, '');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('required')) throw e;
    }
  });

  await test('Validate number field', async () => {
    const field = { type: 'number', label: 'Test', required: false };
    validateFieldValue(field, 42);
  });

  await test('Validate select field options', async () => {
    const field = {
      type: 'select',
      label: 'Test',
      required: false,
      options: JSON.stringify(['A', 'B', 'C']),
    };
    validateFieldValue(field, 'A');
    try {
      validateFieldValue(field, 'D');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('must be one of')) throw e;
    }
  });

  await test('Validate date field', async () => {
    const field = { type: 'date', label: 'Test', required: false };
    validateFieldValue(field, '2026-03-23');
  });

  await test('Validate checkbox field', async () => {
    const field = { type: 'checkbox', label: 'Test', required: false };
    validateFieldValue(field, true);
  });

  await test('Validate text field with regex', async () => {
    const field = {
      type: 'text',
      label: 'Test',
      required: false,
      regex: '^[A-Z]+$',
    };
    validateFieldValue(field, 'ABC');
  });

  // === Summary ===
  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║                    Test Results                             ║`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);
  console.log(`║  ✓ Passed: ${passCount.toString().padEnd(46)} ║`);
  console.log(`║  ✗ Failed: ${failCount.toString().padEnd(46)} ║`);
  console.log(`║  ─────────────────────────────────────────────────────────── ║`);
  console.log(`║  Total:   ${(passCount + failCount).toString().padEnd(46)} ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);

  await cleanup();
  await db.$disconnect();

  if (failCount > 0) {
    console.log('❌ Some tests failed. Please review the errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed! Implementation is complete.\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
