import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import tracksRouter from '../../routes/tracks.js';

/**
 * Comprehensive tests for Track and Task Template APIs (TASK 5.1-5.2)
 *
 * Task 5.1: Track Template CRUD
 * - GET /api/tracks (list all tracks with items/tasks)
 * - POST /api/tracks (create: name, type [company/role/client], description, clientId if client type, autoApply for company)
 * - PATCH /api/tracks/:id (update name, description, autoApply)
 * - DELETE /api/tracks/:id (soft delete, set active=false or isActive=false)
 *
 * Task 5.2: Task Template CRUD
 * - POST /api/tracks/:trackId/tasks (create: name, description, ownerRole, dueDaysOffset, order)
 * - PATCH /api/tracks/:trackId/tasks/:taskId (update name, ownerRole, dueDaysOffset, order)
 * - DELETE /api/tracks/:trackId/tasks/:taskId (delete task template)
 * - GET /api/tracks/:trackId/tasks (list tasks ordered by order field)
 *
 * Context:
 * - dueDaysOffset: relative to employee startDate. Negative = before start, 0 = start date, positive = after start
 * - Auth: requireAuth (any user can read, admin can write)
 */

describe('Track & Task Template APIs (TASK 5.1-5.2)', () => {
  let app;
  let adminUserId;

  beforeEach(async () => {
    // Create admin user for testing
    adminUserId = 'admin-test-user';
    await db.user.upsert({
      where: { email: 'admin@test.com' },
      update: { role: 'admin' },
      create: {
        id: adminUserId,
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'admin',
      },
    });

    app = express();
    app.use(express.json());
    // Mock session for auth
    app.use((req, res, next) => {
      req.session = { userId: adminUserId };
      next();
    });
    app.use('/api/tracks', tracksRouter);
    app.use((err, req, res, next) => {
      console.error('[Test Error]', err.message);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    });
  });

  beforeEach(async () => {
    // Clean up database before each test
    await db.taskInstance.deleteMany({});
    await db.onboardingRun.deleteMany({});
    await db.taskTemplate.deleteMany({});
    await db.trackTemplate.deleteMany({});
    await db.client.deleteMany({});
    await db.employee.deleteMany({});
  });

  afterAll(async () => {
    await db.user.deleteMany({});
    await db.$disconnect();
  });

  // ==================== HELPER FUNCTIONS ====================

  async function createTestClient(overrides = {}) {
    return db.client.create({
      data: {
        name: `test-client-${Math.random().toString(36).substr(2, 9)}`,
        primaryContact: 'John Doe',
        email: 'contact@example.com',
        ...overrides,
      },
    });
  }

  async function createTestTrack(overrides = {}) {
    return db.trackTemplate.create({
      data: {
        name: `test-track-${Math.random().toString(36).substr(2, 9)}`,
        type: 'company',
        description: 'Test track',
        autoApply: false,
        ...overrides,
      },
    });
  }

  async function createTestTask(trackId, overrides = {}) {
    return db.taskTemplate.create({
      data: {
        trackId,
        name: `test-task-${Math.random().toString(36).substr(2, 9)}`,
        description: 'Test task',
        ownerRole: 'ops',
        dueDaysOffset: 0,
        order: 0,
        ...overrides,
      },
    });
  }

  // ==================== TASK 5.1: TRACK TEMPLATE CRUD ====================

  describe('TASK 5.1: Track Template CRUD', () => {
    // GET /api/tracks - List all tracks
    describe('GET /api/tracks', () => {
      test('should return empty array initially', async () => {
        const res = await request(app).get('/api/tracks');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
      });

      test('should list all tracks with tasks included', async () => {
        const track1 = await createTestTrack({ name: 'Company Onboarding', type: 'company', autoApply: true });
        const track2 = await createTestTrack({ name: 'Role Setup', type: 'role', autoApply: false });

        const task1 = await createTestTask(track1.id, { name: 'Task 1', order: 1 });
        const task2 = await createTestTask(track1.id, { name: 'Task 2', order: 2 });
        const task3 = await createTestTask(track2.id, { name: 'Task 3', order: 1 });

        const res = await request(app).get('/api/tracks');

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

        // Find track1 in response
        const foundTrack1 = res.body.find(t => t.id === track1.id);
        expect(foundTrack1).toBeDefined();
        expect(foundTrack1.name).toBe('Company Onboarding');
        expect(foundTrack1.type).toBe('company');
        expect(foundTrack1.autoApply).toBe(true);
        expect(Array.isArray(foundTrack1.tasks)).toBe(true);
        expect(foundTrack1.tasks.length).toBe(2);

        // Find track2 in response
        const foundTrack2 = res.body.find(t => t.id === track2.id);
        expect(foundTrack2).toBeDefined();
        expect(foundTrack2.tasks.length).toBe(1);
      });

      test('should filter by type parameter', async () => {
        await createTestTrack({ name: 'Company Track', type: 'company' });
        await createTestTrack({ name: 'Role Track', type: 'role' });
        await createTestTrack({ name: 'Client Track', type: 'client' });

        const res = await request(app).get('/api/tracks?type=company');

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].type).toBe('company');
      });

      test('should filter by autoApply parameter', async () => {
        await createTestTrack({ name: 'Auto Apply', type: 'company', autoApply: true });
        await createTestTrack({ name: 'Manual Apply', type: 'company', autoApply: false });

        const res = await request(app).get('/api/tracks?autoApply=true');

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].autoApply).toBe(true);
      });
    });

    // POST /api/tracks - Create track
    describe('POST /api/tracks', () => {
      test('should create company track with autoApply', async () => {
        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Company Onboarding',
            type: 'company',
            description: 'Standard company onboarding',
            autoApply: true,
          });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe('Company Onboarding');
        expect(res.body.type).toBe('company');
        expect(res.body.autoApply).toBe(true);
        expect(res.body.description).toBe('Standard company onboarding');
      });

      test('should create role track without autoApply', async () => {
        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Engineer Role Setup',
            type: 'role',
            description: 'Role-specific setup tasks',
            autoApply: false,
          });

        expect(res.status).toBe(201);
        expect(res.body.type).toBe('role');
        expect(res.body.autoApply).toBe(false);
      });

      test('should create client track with clientId', async () => {
        const client = await createTestClient();

        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Acme Corp Onboarding',
            type: 'client',
            description: 'Client-specific onboarding',
            clientId: client.id,
          });

        expect(res.status).toBe(201);
        expect(res.body.type).toBe('client');
        expect(res.body.clientId).toBe(client.id);
      });

      test('should reject with missing required fields', async () => {
        const res = await request(app)
          .post('/api/tracks')
          .send({
            description: 'No name or type',
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeTruthy();
      });

      test('should reject with invalid type', async () => {
        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Invalid Track',
            type: 'invalid',
            description: 'Bad type',
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeTruthy();
      });

      test('should reject if client type without clientId', async () => {
        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Client Track',
            type: 'client',
            description: 'Missing clientId',
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeTruthy();
      });

      test('should reject if clientId does not exist', async () => {
        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Client Track',
            type: 'client',
            clientId: 'non-existent-client-id',
            description: 'Invalid clientId',
          });

        expect(res.status).toBe(404);
        expect(res.body.error).toBeTruthy();
      });

      test('should enforce unique constraint on (name, type, clientId)', async () => {
        const client = await createTestClient();

        // Create first track
        await request(app)
          .post('/api/tracks')
          .send({
            name: 'Duplicate Track',
            type: 'client',
            clientId: client.id,
          });

        // Try to create duplicate
        const res = await request(app)
          .post('/api/tracks')
          .send({
            name: 'Duplicate Track',
            type: 'client',
            clientId: client.id,
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeTruthy();
      });
    });

    // PATCH /api/tracks/:id - Update track
    describe('PATCH /api/tracks/:id', () => {
      test('should update name', async () => {
        const track = await createTestTrack({ name: 'Old Name' });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}`)
          .send({ name: 'New Name' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('New Name');
      });

      test('should update description', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .patch(`/api/tracks/${track.id}`)
          .send({ description: 'Updated description' });

        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Updated description');
      });

      test('should update autoApply', async () => {
        const track = await createTestTrack({ autoApply: false });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}`)
          .send({ autoApply: true });

        expect(res.status).toBe(200);
        expect(res.body.autoApply).toBe(true);
      });

      test('should update multiple fields', async () => {
        const track = await createTestTrack({ name: 'Old', description: 'Old desc' });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}`)
          .send({
            name: 'New Name',
            description: 'New description',
            autoApply: true,
          });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('New Name');
        expect(res.body.description).toBe('New description');
        expect(res.body.autoApply).toBe(true);
      });

      test('should return 404 for non-existent track', async () => {
        const res = await request(app)
          .patch('/api/tracks/non-existent-id')
          .send({ name: 'Updated' });

        expect(res.status).toBe(404);
        expect(res.body.error).toBeTruthy();
      });

      test('should not allow updating type', async () => {
        const track = await createTestTrack({ type: 'company' });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}`)
          .send({ type: 'role' });

        // Type should not change
        const updated = await db.trackTemplate.findUnique({ where: { id: track.id } });
        expect(updated.type).toBe('company');
      });
    });

    // DELETE /api/tracks/:id - Delete track
    describe('DELETE /api/tracks/:id', () => {
      test('should soft delete track', async () => {
        const track = await createTestTrack();

        const res = await request(app).delete(`/api/tracks/${track.id}`);

        expect(res.status).toBe(204);

        // Verify track is marked as inactive (if isActive field exists)
        // or actually deleted depending on implementation
        const deleted = await db.trackTemplate.findUnique({ where: { id: track.id } });
        // Should be either deleted or marked inactive
        expect(deleted === null || deleted.isActive === false).toBe(true);
      });

      test('should return 404 when deleting non-existent track', async () => {
        const res = await request(app).delete('/api/tracks/non-existent-id');

        expect(res.status).toBe(404);
      });

      test('should delete associated tasks when deleting track', async () => {
        const track = await createTestTrack();
        const task1 = await createTestTask(track.id, { name: 'Task 1' });
        const task2 = await createTestTask(track.id, { name: 'Task 2' });

        const res = await request(app).delete(`/api/tracks/${track.id}`);

        expect(res.status).toBe(204);

        // Verify tasks are deleted
        const remainingTasks = await db.taskTemplate.findMany({ where: { trackId: track.id } });
        expect(remainingTasks.length).toBe(0);
      });
    });
  });

  // ==================== TASK 5.2: TASK TEMPLATE CRUD ====================

  describe('TASK 5.2: Task Template CRUD', () => {
    // POST /api/tracks/:trackId/tasks - Create task
    describe('POST /api/tracks/:trackId/tasks', () => {
      test('should create task with positive dueDaysOffset', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .post(`/api/tracks/${track.id}/tasks`)
          .send({
            name: 'Equipment Setup',
            description: 'Set up laptop and peripherals',
            ownerRole: 'ops',
            dueDaysOffset: 1,
            order: 1,
          });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.trackId).toBe(track.id);
        expect(res.body.name).toBe('Equipment Setup');
        expect(res.body.ownerRole).toBe('ops');
        expect(res.body.dueDaysOffset).toBe(1);
        expect(res.body.order).toBe(1);
      });

      test('should create task with zero dueDaysOffset (start date)', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .post(`/api/tracks/${track.id}/tasks`)
          .send({
            name: 'First Day',
            description: 'Employee first day',
            ownerRole: 'pm',
            dueDaysOffset: 0,
            order: 0,
          });

        expect(res.status).toBe(201);
        expect(res.body.dueDaysOffset).toBe(0);
      });

      test('should create task with negative dueDaysOffset (before start)', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .post(`/api/tracks/${track.id}/tasks`)
          .send({
            name: 'Pre-onboarding',
            description: '2 weeks before start',
            ownerRole: 'hiring_manager',
            dueDaysOffset: -14,
            order: -1,
          });

        expect(res.status).toBe(201);
        expect(res.body.dueDaysOffset).toBe(-14);
      });

      test('should reject with missing required fields', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .post(`/api/tracks/${track.id}/tasks`)
          .send({
            description: 'No name',
            ownerRole: 'ops',
          });

        expect(res.status).toBe(400);
      });

      test('should return 404 for non-existent track', async () => {
        const res = await request(app)
          .post('/api/tracks/non-existent-id/tasks')
          .send({
            name: 'Task',
            description: 'Test',
            ownerRole: 'ops',
            dueDaysOffset: 0,
            order: 0,
          });

        expect(res.status).toBe(404);
      });

      test('should default order to 0 if not provided', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .post(`/api/tracks/${track.id}/tasks`)
          .send({
            name: 'Task',
            description: 'Test',
            ownerRole: 'ops',
            dueDaysOffset: 0,
          });

        expect(res.status).toBe(201);
        expect(res.body.order).toBe(0);
      });
    });

    // GET /api/tracks/:trackId/tasks - List tasks
    describe('GET /api/tracks/:trackId/tasks', () => {
      test('should return empty array initially', async () => {
        const track = await createTestTrack();

        const res = await request(app).get(`/api/tracks/${track.id}/tasks`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
      });

      test('should list tasks ordered by order field', async () => {
        const track = await createTestTrack();

        // Create tasks in non-sequential order
        await createTestTask(track.id, { name: 'Task 3', order: 3 });
        await createTestTask(track.id, { name: 'Task 1', order: 1 });
        await createTestTask(track.id, { name: 'Task 2', order: 2 });

        const res = await request(app).get(`/api/tracks/${track.id}/tasks`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[0].order).toBe(1);
        expect(res.body[1].order).toBe(2);
        expect(res.body[2].order).toBe(3);
      });

      test('should handle negative order values', async () => {
        const track = await createTestTrack();

        await createTestTask(track.id, { name: 'Pre-task', order: -1 });
        await createTestTask(track.id, { name: 'Main task', order: 0 });
        await createTestTask(track.id, { name: 'Post task', order: 1 });

        const res = await request(app).get(`/api/tracks/${track.id}/tasks`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[0].order).toBe(-1);
        expect(res.body[1].order).toBe(0);
        expect(res.body[2].order).toBe(1);
      });

      test('should return 404 for non-existent track', async () => {
        const res = await request(app).get('/api/tracks/non-existent-id/tasks');

        expect(res.status).toBe(404);
      });
    });

    // PATCH /api/tracks/:trackId/tasks/:taskId - Update task
    describe('PATCH /api/tracks/:trackId/tasks/:taskId', () => {
      test('should update name', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id, { name: 'Old Name' });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}/tasks/${task.id}`)
          .send({ name: 'New Name' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('New Name');
      });

      test('should update ownerRole', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id, { ownerRole: 'ops' });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}/tasks/${task.id}`)
          .send({ ownerRole: 'pm' });

        expect(res.status).toBe(200);
        expect(res.body.ownerRole).toBe('pm');
      });

      test('should update dueDaysOffset', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id, { dueDaysOffset: 0 });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}/tasks/${task.id}`)
          .send({ dueDaysOffset: 7 });

        expect(res.status).toBe(200);
        expect(res.body.dueDaysOffset).toBe(7);
      });

      test('should update order', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id, { order: 1 });

        const res = await request(app)
          .patch(`/api/tracks/${track.id}/tasks/${task.id}`)
          .send({ order: 5 });

        expect(res.status).toBe(200);
        expect(res.body.order).toBe(5);
      });

      test('should update multiple fields', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id);

        const res = await request(app)
          .patch(`/api/tracks/${track.id}/tasks/${task.id}`)
          .send({
            name: 'Updated Name',
            ownerRole: 'hiring_manager',
            dueDaysOffset: 14,
            order: 2,
          });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Name');
        expect(res.body.ownerRole).toBe('hiring_manager');
        expect(res.body.dueDaysOffset).toBe(14);
        expect(res.body.order).toBe(2);
      });

      test('should return 404 for non-existent track', async () => {
        const res = await request(app)
          .patch('/api/tracks/non-existent-id/tasks/task-id')
          .send({ name: 'Updated' });

        expect(res.status).toBe(404);
      });

      test('should return 404 for non-existent task', async () => {
        const track = await createTestTrack();

        const res = await request(app)
          .patch(`/api/tracks/${track.id}/tasks/non-existent-id`)
          .send({ name: 'Updated' });

        expect(res.status).toBe(404);
      });
    });

    // DELETE /api/tracks/:trackId/tasks/:taskId - Delete task
    describe('DELETE /api/tracks/:trackId/tasks/:taskId', () => {
      test('should delete task', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id);

        const res = await request(app).delete(`/api/tracks/${track.id}/tasks/${task.id}`);

        expect(res.status).toBe(204);

        // Verify task is deleted
        const deleted = await db.taskTemplate.findUnique({ where: { id: task.id } });
        expect(deleted).toBeNull();
      });

      test('should return 404 for non-existent track', async () => {
        const res = await request(app).delete('/api/tracks/non-existent-id/tasks/task-id');

        expect(res.status).toBe(404);
      });

      test('should return 404 for non-existent task', async () => {
        const track = await createTestTrack();

        const res = await request(app).delete(`/api/tracks/${track.id}/tasks/non-existent-id`);

        expect(res.status).toBe(404);
      });

      test('should handle deleting task with instances gracefully', async () => {
        const track = await createTestTrack();
        const task = await createTestTask(track.id);

        // Create an employee and onboarding run
        const employee = await db.employee.create({
          data: {
            name: 'Test Employee',
            email: `test-emp-${Math.random().toString(36).substr(2, 9)}@example.com`,
            title: 'Engineer',
            startDate: new Date(),
          },
        });

        const run = await db.onboardingRun.create({
          data: {
            employeeId: employee.id,
            trackId: track.id,
            type: 'onboarding',
          },
        });

        const instance = await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: task.id,
          },
        });

        // Deleting task should handle or reject appropriately
        const res = await request(app).delete(`/api/tracks/${track.id}/tasks/${task.id}`);

        // Should either succeed or return appropriate error
        expect([204, 400, 409]).toContain(res.status);
      });
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Integration: Full Track Workflow', () => {
    test('should create track with multiple tasks and list them', async () => {
      // Create track
      const trackRes = await request(app)
        .post('/api/tracks')
        .send({
          name: 'Full Onboarding',
          type: 'company',
          autoApply: true,
        });

      expect(trackRes.status).toBe(201);
      const trackId = trackRes.body.id;

      // Create multiple tasks
      const task1Res = await request(app)
        .post(`/api/tracks/${trackId}/tasks`)
        .send({
          name: 'Pre-onboarding',
          ownerRole: 'hiring_manager',
          dueDaysOffset: -14,
          order: 1,
        });

      const task2Res = await request(app)
        .post(`/api/tracks/${trackId}/tasks`)
        .send({
          name: 'First Day',
          ownerRole: 'pm',
          dueDaysOffset: 0,
          order: 2,
        });

      const task3Res = await request(app)
        .post(`/api/tracks/${trackId}/tasks`)
        .send({
          name: 'Week 1 Check-in',
          ownerRole: 'pm',
          dueDaysOffset: 7,
          order: 3,
        });

      // List all tracks with tasks
      const listRes = await request(app).get('/api/tracks');

      expect(listRes.status).toBe(200);
      const foundTrack = listRes.body.find(t => t.id === trackId);
      expect(foundTrack).toBeDefined();
      expect(foundTrack.tasks.length).toBe(3);
      expect(foundTrack.tasks[0].order).toBe(1);
      expect(foundTrack.tasks[1].order).toBe(2);
      expect(foundTrack.tasks[2].order).toBe(3);

      // Update a task
      const updateRes = await request(app)
        .patch(`/api/tracks/${trackId}/tasks/${task1Res.body.id}`)
        .send({ ownerRole: 'ops' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.ownerRole).toBe('ops');
    });

    test('should support multiple client-specific tracks', async () => {
      const client1 = await createTestClient({ name: 'Client A' });
      const client2 = await createTestClient({ name: 'Client B' });

      // Create client-specific tracks
      const track1Res = await request(app)
        .post('/api/tracks')
        .send({
          name: 'Acme Onboarding',
          type: 'client',
          clientId: client1.id,
        });

      const track2Res = await request(app)
        .post('/api/tracks')
        .send({
          name: 'Acme Onboarding',
          type: 'client',
          clientId: client2.id,
        });

      expect(track1Res.status).toBe(201);
      expect(track2Res.status).toBe(201);
      expect(track1Res.body.id).not.toBe(track2Res.body.id);

      // List all tracks
      const listRes = await request(app).get('/api/tracks');

      expect(listRes.status).toBe(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(2);
    });
  });
});
