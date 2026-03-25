import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import onboardingRouter from '../../routes/onboarding.js';

/**
 * Comprehensive tests for Onboarding/Offboarding Run & Task Instance APIs (TASK 6.1-6.2)
 *
 * Task 6.1: Onboarding Run API
 * - GET /api/employees/:employeeId/onboarding-runs (list runs for employee)
 * - GET /api/onboarding-runs/:runId (detail with tasks, calculate progress %)
 * - PATCH /api/onboarding-runs/:runId (update status: pending/in_progress/complete)
 * - GET /api/dashboard/pending-tasks (tasks due next 7 days, grouped by employee)
 *
 * Task 6.2: Task Instance API
 * - PATCH /api/onboarding-runs/:runId/tasks/:taskId (update status, completedAt, notes, assignedTo)
 * - Status values: pending, in_progress, complete, skipped
 * - Calculate dueDate from OnboardingRun.startDate + TaskTemplate.dueDaysOffset
 */

describe('Onboarding/Offboarding Run & Task Instance APIs (TASK 6.1-6.2)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', onboardingRouter);
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
    await db.employee.deleteMany({});
    await db.candidate.deleteMany({});
    await db.client.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  // ==================== HELPER FUNCTIONS ====================

  async function createTestClient(overrides = {}) {
    return db.client.create({
      data: {
        name: `Client-${Math.random().toString(36).substr(2, 9)}`,
        primaryContact: 'John Doe',
        email: `client-${Math.random().toString(36).substr(2, 9)}@example.com`,
        ...overrides,
      },
    });
  }

  async function createTestTrackTemplate(clientId = null, overrides = {}) {
    return db.trackTemplate.create({
      data: {
        name: `Track-${Math.random().toString(36).substr(2, 9)}`,
        type: 'company',
        description: 'Test onboarding track',
        clientId,
        autoApply: true,
        ...overrides,
      },
    });
  }

  async function createTestTaskTemplates(trackId, count = 3) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push(
        await db.taskTemplate.create({
          data: {
            trackId,
            name: `Task ${i + 1}`,
            description: `Task ${i + 1} description`,
            ownerRole: 'ops',
            dueDaysOffset: i === 0 ? 3 : i === 1 ? 7 : 14,
            order: i,
          },
        })
      );
    }
    return tasks;
  }

  async function createTestEmployee(overrides = {}) {
    return db.employee.create({
      data: {
        name: 'Test Employee',
        email: `emp-${Math.random().toString(36).substr(2, 9)}@example.com`,
        title: 'Engineer',
        department: 'Engineering',
        startDate: new Date(),
        status: 'active',
        ...overrides,
      },
    });
  }

  async function createTestOnboardingRun(employeeId, trackId, overrides = {}) {
    return db.onboardingRun.create({
      data: {
        employeeId,
        trackId,
        type: 'onboarding',
        status: 'pending',
        startDate: new Date(),
        ...overrides,
      },
    });
  }

  async function createTestTaskInstances(runId, taskTemplateIds) {
    const run = await db.onboardingRun.findUnique({ where: { id: runId } });
    const instances = [];

    for (const templateId of taskTemplateIds) {
      const template = await db.taskTemplate.findUnique({ where: { id: templateId } });
      const dueDate = new Date(run.startDate);
      dueDate.setDate(dueDate.getDate() + (template.dueDaysOffset || 0));

      instances.push(
        await db.taskInstance.create({
          data: {
            runId,
            taskTemplateId: templateId,
            assignedTo: 'ops',
            dueDate,
            status: 'pending',
          },
        })
      );
    }
    return instances;
  }

  // ==================== PHASE 5: TEMPLATE ENDPOINTS ====================

  describe('GET /api/templates', () => {
    test('should return all templates', async () => {
      const res = await request(app).get('/api/templates');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.error).toBeNull();
    });

    test('should return templates with expected shape', async () => {
      const res = await request(app).get('/api/templates');

      expect(res.status).toBe(200);
      const template = res.body.data[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('role');
      expect(template).toHaveProperty('items');
      expect(Array.isArray(template.items)).toBe(true);
    });

    test('should filter templates by role', async () => {
      const res = await request(app).get('/api/templates?role=employee');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach(t => {
        expect(t.role).toBe('employee');
      });
    });

    test('should return empty array for non-matching role filter', async () => {
      const res = await request(app).get('/api/templates?role=nonexistent');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  // ==================== TASK 6.1: ONBOARDING RUN API ====================

  describe('TASK 6.1: Onboarding Run API', () => {
    describe('GET /api/employees/:employeeId/onboarding-runs', () => {
      test('should list all onboarding runs for an employee', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run1 = await createTestOnboardingRun(employee.id, track.id);
        const run2 = await createTestOnboardingRun(employee.id, track.id, { type: 'offboarding' });

        const res = await request(app).get(`/api/employees/${employee.id}/onboarding-runs`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        const runIds = res.body.data.map(r => r.id).sort();
        const expectedIds = [run1.id, run2.id].sort();
        expect(runIds).toEqual(expectedIds);
      });

      test('should return empty array if employee has no runs', async () => {
        const employee = await createTestEmployee();

        const res = await request(app).get(`/api/employees/${employee.id}/onboarding-runs`);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
      });

      test('should return 404 if employee does not exist', async () => {
        const res = await request(app).get(`/api/employees/nonexistent-id/onboarding-runs`);

        expect(res.status).toBe(404);
        expect(res.body.error).toContain('Employee not found');
      });

      test('should include task count and progress in run list', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 3);
        const taskInstances = await createTestTaskInstances(run.id, taskTemplates.map(t => t.id));

        const res = await request(app).get(`/api/employees/${employee.id}/onboarding-runs`);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('taskCount');
        expect(res.body.data[0]).toHaveProperty('progress');
        expect(res.body.data[0].taskCount).toBe(3);
        expect(res.body.data[0].progress).toBe(0); // No completed tasks yet
      });
    });

    describe('GET /api/onboarding-runs/:runId', () => {
      test('should return onboarding run detail with all tasks', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 3);
        const taskInstances = await createTestTaskInstances(run.id, taskTemplates.map(t => t.id));

        const res = await request(app).get(`/api/onboarding-runs/${run.id}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(run.id);
        expect(res.body.data.tasks).toHaveLength(3);
        expect(res.body.data).toHaveProperty('progress');
      });

      test('should calculate progress percentage correctly', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 4);
        const taskInstances = await createTestTaskInstances(run.id, taskTemplates.map(t => t.id));

        // Mark 2 as complete, 1 as skipped
        await db.taskInstance.update({
          where: { id: taskInstances[0].id },
          data: { status: 'complete', completedAt: new Date() },
        });
        await db.taskInstance.update({
          where: { id: taskInstances[1].id },
          data: { status: 'complete', completedAt: new Date() },
        });
        await db.taskInstance.update({
          where: { id: taskInstances[3].id },
          data: { status: 'skipped' },
        });

        const res = await request(app).get(`/api/onboarding-runs/${run.id}`);

        expect(res.status).toBe(200);
        // Progress = (2 complete + 1 skipped) / 4 = 75%
        expect(res.body.data.progress).toBe(75);
      });

      test('should include dueDate in task instances', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const startDate = new Date('2026-03-24');
        const run = await createTestOnboardingRun(employee.id, track.id, { startDate });
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, taskTemplates.map(t => t.id));

        const res = await request(app).get(`/api/onboarding-runs/${run.id}`);

        expect(res.status).toBe(200);
        expect(res.body.data.tasks[0]).toHaveProperty('dueDate');
        expect(res.body.data.tasks[0].dueDate).toBeTruthy();
      });

      test('should return 404 if run does not exist', async () => {
        const res = await request(app).get(`/api/onboarding-runs/nonexistent-id`);

        expect(res.status).toBe(404);
        expect(res.body.error).toContain('OnboardingRun not found');
      });
    });

    describe('PATCH /api/onboarding-runs/:runId', () => {
      test('should update run status from pending to in_progress', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id, { status: 'pending' });

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}`)
          .send({ status: 'in_progress' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('in_progress');
      });

      test('should update run status from in_progress to complete', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id, { status: 'in_progress' });

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}`)
          .send({ status: 'complete' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('complete');
      });

      test('should reject invalid status values', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}`)
          .send({ status: 'invalid_status' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid status');
      });

      test('should return 404 if run does not exist', async () => {
        const res = await request(app)
          .patch(`/api/onboarding-runs/nonexistent-id`)
          .send({ status: 'complete' });

        expect(res.status).toBe(404);
        expect(res.body.error).toContain('OnboardingRun not found');
      });

      test('should allow updating other fields besides status', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const newStartDate = new Date('2026-04-01');
        const run = await createTestOnboardingRun(employee.id, track.id);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}`)
          .send({ startDate: newStartDate });

        expect(res.status).toBe(200);
        expect(new Date(res.body.data.startDate)).toEqual(newStartDate);
      });
    });

    describe('GET /api/dashboard/pending-tasks', () => {
      test('should return tasks due in next 7 days grouped by employee', async () => {
        const employee1 = await createTestEmployee({ name: 'Employee 1' });
        const employee2 = await createTestEmployee({ name: 'Employee 2' });
        const track = await createTestTrackTemplate();

        const today = new Date();
        const run1 = await createTestOnboardingRun(employee1.id, track.id, { startDate: today });
        const run2 = await createTestOnboardingRun(employee2.id, track.id, { startDate: today });

        // Create task templates with different due offsets
        const template1 = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'Task 1', dueDaysOffset: 2, order: 0 },
        });
        const template2 = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'Task 2', dueDaysOffset: 10, order: 1 },
        });

        // Create task instances for both employees
        await db.taskInstance.create({
          data: {
            runId: run1.id,
            taskTemplateId: template1.id,
            dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            status: 'pending',
          },
        });
        await db.taskInstance.create({
          data: {
            runId: run2.id,
            taskTemplateId: template1.id,
            dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            status: 'pending',
          },
        });
        // This one is beyond 7 days, should not be included
        await db.taskInstance.create({
          data: {
            runId: run1.id,
            taskTemplateId: template2.id,
            dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
            status: 'pending',
          },
        });

        const res = await request(app).get('/api/dashboard/pending-tasks');

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        // Should have tasks grouped by employee, only tasks due in next 7 days
        const employee1Tasks = res.body.data.find(g => g.employeeId === employee1.id);
        expect(employee1Tasks.tasks).toHaveLength(1);
      });

      test('should exclude completed and skipped tasks', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const today = new Date();
        const run = await createTestOnboardingRun(employee.id, track.id, { startDate: today });

        const template = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'Task 1', dueDaysOffset: 2, order: 0 },
        });

        // Create pending task
        const pendingTask = await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            status: 'pending',
          },
        });

        // Create completed task
        await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            status: 'complete',
            completedAt: new Date(),
          },
        });

        // Create skipped task
        await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            status: 'skipped',
          },
        });

        const res = await request(app).get('/api/dashboard/pending-tasks');

        expect(res.status).toBe(200);
        const tasks = res.body.data[0]?.tasks || [];
        expect(tasks.filter(t => t.status === 'pending')).toHaveLength(1);
      });

      test('should return empty array if no tasks due in next 7 days', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const today = new Date();
        const run = await createTestOnboardingRun(employee.id, track.id, { startDate: today });

        const template = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'Task 1', dueDaysOffset: 30, order: 0 },
        });

        await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
            status: 'pending',
          },
        });

        const res = await request(app).get('/api/dashboard/pending-tasks');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
      });
    });
  });

  // ==================== TASK 6.2: TASK INSTANCE API ====================

  describe('TASK 6.2: Task Instance API', () => {
    describe('PATCH /api/onboarding-runs/:runId/tasks/:taskId', () => {
      test('should update task status from pending to in_progress', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({ status: 'in_progress' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('in_progress');
      });

      test('should update task status from in_progress to complete and set completedAt', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({ status: 'complete' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('complete');
        expect(res.body.data.completedAt).toBeTruthy();
      });

      test('should allow skipping a task', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({ status: 'skipped' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('skipped');
      });

      test('should update task notes', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({ notes: 'Completed successfully' });

        expect(res.status).toBe(200);
        expect(res.body.data.notes).toBe('Completed successfully');
      });

      test('should update assignedTo field', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({ assignedTo: 'hiring_manager' });

        expect(res.status).toBe(200);
        expect(res.body.data.assignedTo).toBe('hiring_manager');
      });

      test('should reject invalid status values', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({ status: 'invalid_status' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid status');
      });

      test('should return 404 if run does not exist', async () => {
        const res = await request(app)
          .patch(`/api/onboarding-runs/nonexistent-run-id/tasks/nonexistent-task-id`)
          .send({ status: 'complete' });

        expect(res.status).toBe(404);
      });

      test('should return 404 if task does not exist', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/nonexistent-task-id`)
          .send({ status: 'complete' });

        expect(res.status).toBe(404);
      });

      test('should allow updating multiple fields at once', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);
        const taskTemplates = await createTestTaskTemplates(track.id, 1);
        const taskInstances = await createTestTaskInstances(run.id, [taskTemplates[0].id]);

        const res = await request(app)
          .patch(`/api/onboarding-runs/${run.id}/tasks/${taskInstances[0].id}`)
          .send({
            status: 'complete',
            notes: 'All done',
            assignedTo: 'pm',
          });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('complete');
        expect(res.body.data.notes).toBe('All done');
        expect(res.body.data.assignedTo).toBe('pm');
      });
    });

    describe('Due Date Calculation', () => {
      test('should calculate dueDate from startDate + dueDaysOffset', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const startDate = new Date('2026-03-24');
        const run = await createTestOnboardingRun(employee.id, track.id, { startDate });

        const template = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'Test Task', dueDaysOffset: 7, order: 0 },
        });

        const instance = await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: new Date('2026-03-31'), // 24 + 7 days
            status: 'pending',
          },
        });

        expect(instance.dueDate).toEqual(new Date('2026-03-31'));
      });

      test('should handle negative dueDaysOffset (before startDate)', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const startDate = new Date('2026-03-24');
        const run = await createTestOnboardingRun(employee.id, track.id, { startDate });

        const template = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'Pre-task', dueDaysOffset: -7, order: 0 },
        });

        // Create instance with calculated dueDate (24 - 7 = 17)
        const instance = await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: new Date('2026-03-17'),
            status: 'pending',
          },
        });

        expect(instance.dueDate).toEqual(new Date('2026-03-17'));
      });

      test('should handle null dueDaysOffset (no deadline)', async () => {
        const employee = await createTestEmployee();
        const track = await createTestTrackTemplate();
        const run = await createTestOnboardingRun(employee.id, track.id);

        const template = await db.taskTemplate.create({
          data: { trackId: track.id, name: 'No deadline task', dueDaysOffset: null, order: 0 },
        });

        const instance = await db.taskInstance.create({
          data: {
            runId: run.id,
            taskTemplateId: template.id,
            dueDate: null,
            status: 'pending',
          },
        });

        expect(instance.dueDate).toBeNull();
      });
    });
  });
});
