import express from 'express';
import customFieldsRouter from '../../routes/admin/customFields.js';
import { db } from '../../db.js';

describe('Custom Fields Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/custom-fields', customFieldsRouter);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Test error:', err.message);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    });
  });

  beforeEach(async () => {
    // Clean up test data
    await db.customFieldValue.deleteMany({});
    await db.customField.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('POST /api/admin/custom-fields', () => {
    test('should create a custom field', async () => {
      const res = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('test_field');
      expect(res.body.error).toBeNull();
    });

    test('should return 400 if missing required fields', async () => {
      const res = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          // missing label, type, entityType
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });

    test('should return 409 if duplicate field name for entityType', async () => {
      // Create first field
      await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field 2',
          type: 'text',
          entityType: 'employee',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    test('should allow same name for different entityTypes', async () => {
      // Create field for employee
      await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      // Create same name for candidate
      const res = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'candidate',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.entityType).toBe('candidate');
    });
  });

  describe('GET /api/admin/custom-fields', () => {
    test('should list all custom fields', async () => {
      // Create test fields
      await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'field1',
          label: 'Field 1',
          type: 'text',
          entityType: 'employee',
        });

      await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'field2',
          label: 'Field 2',
          type: 'text',
          entityType: 'candidate',
        });

      const res = await request(app).get('/api/admin/custom-fields');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.error).toBeNull();
    });

    test('should return empty array if no fields', async () => {
      const res = await request(app).get('/api/admin/custom-fields');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/admin/custom-fields/:id', () => {
    test('should get a custom field by id', async () => {
      const createRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      const id = createRes.body.data.id;
      const res = await request(app).get(`/api/admin/custom-fields/${id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(id);
      expect(res.body.error).toBeNull();
    });

    test('should return 404 if field not found', async () => {
      const res = await request(app).get('/api/admin/custom-fields/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('not found');
    });
  });

  describe('GET /api/admin/custom-fields/entity/:entityType', () => {
    test('should list fields for specific entity type', async () => {
      // Create employee field
      await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'emp_field',
          label: 'Employee Field',
          type: 'text',
          entityType: 'employee',
        });

      // Create candidate field
      await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'cand_field',
          label: 'Candidate Field',
          type: 'text',
          entityType: 'candidate',
        });

      const res = await request(app).get('/api/admin/custom-fields/entity/employee');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].entityType).toBe('employee');
    });

    test('should return 400 for invalid entityType', async () => {
      const res = await request(app).get('/api/admin/custom-fields/entity/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Entity type must be');
    });
  });

  describe('PATCH /api/admin/custom-fields/:id', () => {
    test('should update custom field label', async () => {
      const createRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      const id = createRes.body.data.id;
      const res = await request(app)
        .patch(`/api/admin/custom-fields/${id}`)
        .send({
          label: 'Updated Label',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.label).toBe('Updated Label');
    });

    test('should return 400 if trying to update immutable fields', async () => {
      const createRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      const id = createRes.body.data.id;
      const res = await request(app)
        .patch(`/api/admin/custom-fields/${id}`)
        .send({
          type: 'select',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Cannot update');
    });

    test('should return 404 if field not found', async () => {
      const res = await request(app)
        .patch('/api/admin/custom-fields/nonexistent')
        .send({
          label: 'New Label',
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/admin/custom-fields/:id', () => {
    test('should soft-delete a custom field', async () => {
      const createRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      const id = createRes.body.data.id;
      const deleteRes = await request(app).delete(`/api/admin/custom-fields/${id}`);

      expect(deleteRes.statusCode).toBe(204);

      // Verify field is marked inactive
      const field = await db.customField.findUnique({ where: { id } });
      expect(field.active).toBe(false);
    });

    test('should return 404 if field not found', async () => {
      const res = await request(app).delete('/api/admin/custom-fields/nonexistent');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/admin/custom-fields/:fieldId/values', () => {
    test('should set custom field value', async () => {
      const fieldRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      const fieldId = fieldRes.body.data.id;
      const res = await request(app)
        .post(`/api/admin/custom-fields/${fieldId}/values`)
        .send({
          entityType: 'employee',
          entityId: 'emp123',
          value: 'test value',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.value).toBe('test value');
      expect(res.body.error).toBeNull();
    });

    test('should return 400 if missing required fields', async () => {
      const fieldRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          entityType: 'employee',
        });

      const fieldId = fieldRes.body.data.id;
      const res = await request(app)
        .post(`/api/admin/custom-fields/${fieldId}/values`)
        .send({
          value: 'test value',
          // missing entityType, entityId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });

    test('should return 400 for invalid value', async () => {
      const fieldRes = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'test_select',
          label: 'Test Select',
          type: 'select',
          entityType: 'employee',
          options: JSON.stringify(['A', 'B', 'C']),
        });

      const fieldId = fieldRes.body.data.id;
      const res = await request(app)
        .post(`/api/admin/custom-fields/${fieldId}/values`)
        .send({
          entityType: 'employee',
          entityId: 'emp123',
          value: 'D',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('must be one of');
    });
  });

  describe('GET /api/admin/custom-fields/values/:entityType/:entityId', () => {
    test('should get all field values for an entity', async () => {
      const field1Res = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'field1',
          label: 'Field 1',
          type: 'text',
          entityType: 'employee',
          order: 1,
        });

      const field2Res = await request(app)
        .post('/api/admin/custom-fields')
        .send({
          name: 'field2',
          label: 'Field 2',
          type: 'text',
          entityType: 'employee',
          order: 2,
        });

      const fieldId1 = field1Res.body.data.id;
      const fieldId2 = field2Res.body.data.id;

      await request(app)
        .post(`/api/admin/custom-fields/${fieldId1}/values`)
        .send({
          entityType: 'employee',
          entityId: 'emp123',
          value: 'value1',
        });

      await request(app)
        .post(`/api/admin/custom-fields/${fieldId2}/values`)
        .send({
          entityType: 'employee',
          entityId: 'emp123',
          value: 'value2',
        });

      const res = await request(app).get('/api/admin/custom-fields/values/employee/emp123');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.error).toBeNull();
    });
  });
});

// Helper function to make requests (using native Node.js)
function request(app) {
  return {
    post(url) {
      return {
        send(data) {
          return new Promise((resolve, reject) => {
            const req = {
              method: 'POST',
              url,
              body: data,
              headers: { 'content-type': 'application/json' },
            };
            const res = {
              statusCode: 201,
              body: {},
              json(data) {
                this.body = data;
                resolve(this);
              },
              status(code) {
                this.statusCode = code;
                return this;
              },
            };
            // Simulate request handling
            try {
              app._router.handle(req, res);
            } catch (e) {
              reject(e);
            }
          });
        },
      };
    },
    get(url) {
      return new Promise((resolve, reject) => {
        const req = {
          method: 'GET',
          url,
          headers: {},
        };
        const res = {
          statusCode: 200,
          body: {},
          json(data) {
            this.body = data;
            resolve(this);
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
        };
        try {
          app._router.handle(req, res);
        } catch (e) {
          reject(e);
        }
      });
    },
    delete(url) {
      return new Promise((resolve, reject) => {
        const req = {
          method: 'DELETE',
          url,
          headers: {},
        };
        const res = {
          statusCode: 204,
          send() {
            resolve(this);
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            this.statusCode = this.statusCode || 404;
            resolve(this);
          },
        };
        try {
          app._router.handle(req, res);
        } catch (e) {
          reject(e);
        }
      });
    },
    patch(url) {
      return {
        send(data) {
          return new Promise((resolve, reject) => {
            const req = {
              method: 'PATCH',
              url,
              body: data,
              headers: { 'content-type': 'application/json' },
            };
            const res = {
              statusCode: 200,
              body: {},
              json(data) {
                this.body = data;
                resolve(this);
              },
              status(code) {
                this.statusCode = code;
                return this;
              },
            };
            try {
              app._router.handle(req, res);
            } catch (e) {
              reject(e);
            }
          });
        },
      };
    },
  };
}
