/**
 * API Integration Test for Custom Fields
 * Run with: npm test -- server/tests/api.test.js
 */

import express from 'express';
import customFieldsRouter from '../routes/admin/customFields.js';
import { db } from '../db.js';
import { errorHandler } from '../middleware/errorHandler.js';

let app;
let passCount = 0;
let failCount = 0;

function setupApp() {
  const newApp = express();
  newApp.use(express.json());
  newApp.use('/api/admin/custom-fields', customFieldsRouter);
  newApp.use(errorHandler);
  return newApp;
}

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

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      path,
      url: path,
      body,
      headers: body ? { 'content-type': 'application/json' } : {},
      on: () => {},
    };

    let statusCode = 200;
    let responseData = null;

    const res = {
      statusCode,
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ statusCode, data });
      },
      send() {
        resolve({ statusCode, data: null });
      },
      setHeader: () => {},
      end: () => {
        resolve({ statusCode, data: responseData });
      },
    };

    try {
      app(req, res);
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  console.log('\n=== Custom Fields API Integration Tests ===\n');

  app = setupApp();

  // Test: Create a custom field
  await test('should create a custom field via POST', async () => {
    await cleanup();
    const { statusCode, data } = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    if (statusCode !== 201 || !data.data.id) {
      throw new Error(`Expected 201, got ${statusCode}`);
    }
  });

  // Test: Missing required fields
  await test('should return 400 for missing required fields', async () => {
    await cleanup();
    const { statusCode } = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
    });
    if (statusCode !== 400) {
      throw new Error(`Expected 400, got ${statusCode}`);
    }
  });

  // Test: Duplicate field name
  await test('should return 409 for duplicate field name', async () => {
    await cleanup();
    // Create first field
    const res1 = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    // Try to create duplicate
    const res2 = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field 2',
      type: 'text',
      entityType: 'employee',
    });
    if (res2.statusCode !== 409) {
      throw new Error(`Expected 409, got ${res2.statusCode}`);
    }
  });

  // Test: List all fields
  await test('should list all custom fields', async () => {
    await cleanup();
    await request('POST', '/api/admin/custom-fields', {
      name: 'field1',
      label: 'Field 1',
      type: 'text',
      entityType: 'employee',
    });
    await request('POST', '/api/admin/custom-fields', {
      name: 'field2',
      label: 'Field 2',
      type: 'text',
      entityType: 'candidate',
    });
    const { statusCode, data } = await request('GET', '/api/admin/custom-fields');
    if (statusCode !== 200 || data.data.length !== 2) {
      throw new Error(`Expected 200 with 2 fields, got ${statusCode} with ${data.data?.length}`);
    }
  });

  // Test: Get field by ID
  await test('should get a custom field by ID', async () => {
    await cleanup();
    const createRes = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const id = createRes.data.data.id;
    const { statusCode, data } = await request('GET', `/api/admin/custom-fields/${id}`);
    if (statusCode !== 200 || data.data.id !== id) {
      throw new Error(`Expected 200 with field, got ${statusCode}`);
    }
  });

  // Test: Get field by entity type
  await test('should list fields by entity type', async () => {
    await cleanup();
    await request('POST', '/api/admin/custom-fields', {
      name: 'emp_field',
      label: 'Employee Field',
      type: 'text',
      entityType: 'employee',
    });
    await request('POST', '/api/admin/custom-fields', {
      name: 'cand_field',
      label: 'Candidate Field',
      type: 'text',
      entityType: 'candidate',
    });
    const { statusCode, data } = await request('GET', '/api/admin/custom-fields/entity/employee');
    if (statusCode !== 200 || data.data.length !== 1 || data.data[0].entityType !== 'employee') {
      throw new Error(`Expected 200 with employee field only`);
    }
  });

  // Test: Update field
  await test('should update a custom field', async () => {
    await cleanup();
    const createRes = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const id = createRes.data.data.id;
    const { statusCode, data } = await request('PATCH', `/api/admin/custom-fields/${id}`, {
      label: 'Updated Label',
    });
    if (statusCode !== 200 || data.data.label !== 'Updated Label') {
      throw new Error(`Expected 200 with updated label, got ${statusCode}`);
    }
  });

  // Test: Delete field
  await test('should delete a custom field (soft delete)', async () => {
    await cleanup();
    const createRes = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const id = createRes.data.data.id;
    const { statusCode } = await request('DELETE', `/api/admin/custom-fields/${id}`);
    if (statusCode !== 204) {
      throw new Error(`Expected 204, got ${statusCode}`);
    }
    // Verify field is marked inactive
    const field = await db.customField.findUnique({ where: { id } });
    if (field.active !== false) {
      throw new Error('Field not marked as inactive');
    }
  });

  // Test: Set field value
  await test('should set a custom field value', async () => {
    await cleanup();
    const fieldRes = await request('POST', '/api/admin/custom-fields', {
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
      entityType: 'employee',
    });
    const fieldId = fieldRes.data.data.id;
    const { statusCode, data } = await request(
      'POST',
      `/api/admin/custom-fields/${fieldId}/values`,
      {
        entityType: 'employee',
        entityId: 'emp123',
        value: 'test value',
      }
    );
    if (statusCode !== 201 || data.data.value !== 'test value') {
      throw new Error(`Expected 201 with value, got ${statusCode}`);
    }
  });

  // Test: Get field values for entity
  await test('should get all field values for an entity', async () => {
    await cleanup();
    const field1Res = await request('POST', '/api/admin/custom-fields', {
      name: 'field1',
      label: 'Field 1',
      type: 'text',
      entityType: 'employee',
      order: 1,
    });
    const field2Res = await request('POST', '/api/admin/custom-fields', {
      name: 'field2',
      label: 'Field 2',
      type: 'text',
      entityType: 'employee',
      order: 2,
    });
    const fieldId1 = field1Res.data.data.id;
    const fieldId2 = field2Res.data.data.id;

    await request('POST', `/api/admin/custom-fields/${fieldId1}/values`, {
      entityType: 'employee',
      entityId: 'emp123',
      value: 'value1',
    });
    await request('POST', `/api/admin/custom-fields/${fieldId2}/values`, {
      entityType: 'employee',
      entityId: 'emp123',
      value: 'value2',
    });

    const { statusCode, data } = await request('GET', '/api/admin/custom-fields/values/employee/emp123');
    if (statusCode !== 200 || data.data.length !== 2) {
      throw new Error(`Expected 200 with 2 values, got ${statusCode}`);
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
