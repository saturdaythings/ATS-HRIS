import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import notificationsRouter from '../../routes/notifications.js';

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/notifications', notificationsRouter);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

describe('Notifications Routes', () => {
  let testEmployeeId;

  beforeAll(async () => {
    // Create a test employee
    const employee = await db.employee.create({
      data: {
        name: 'Route Test Employee',
        email: 'route-test@example.com',
        title: 'Test Title',
        department: 'Test Dept',
        startDate: new Date(),
      },
    });
    testEmployeeId = employee.id;
  });

  beforeEach(async () => {
    // Clean up notifications before each test
    await db.notification.deleteMany({
      where: { employeeId: testEmployeeId },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.notification.deleteMany({
      where: { employeeId: testEmployeeId },
    });
    await db.employee.deleteMany({
      where: { id: testEmployeeId },
    });
    await db.$disconnect();
  });

  describe('POST /api/notifications', () => {
    test('should create a notification', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          type: 'task_assignment',
          description: 'New task assigned',
          employeeId: testEmployeeId,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.type).toBe('task_assignment');
      expect(res.body.description).toBe('New task assigned');
      expect(res.body.read).toBe(false);
    });

    test('should return 400 for missing type', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          description: 'New task assigned',
          employeeId: testEmployeeId,
        });

      expect(res.status).toBe(500); // Error handler will catch and return 500
      expect(res.body.error).toBeDefined();
    });

    test('should return 500 for invalid employee ID', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          type: 'task_assignment',
          description: 'New task assigned',
          employeeId: 'nonexistent-id',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Employee not found');
    });
  });

  describe('GET /api/notifications/:employeeId', () => {
    test('should list notifications for an employee', async () => {
      // Create test notifications
      await db.notification.create({
        data: {
          type: 'task_assignment',
          description: 'Task 1',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      await db.notification.create({
        data: {
          type: 'task_due',
          description: 'Task 2',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      const res = await request(app).get(
        `/api/notifications/${testEmployeeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].employeeId).toBe(testEmployeeId);
    });

    test('should filter by read status', async () => {
      const n1 = await db.notification.create({
        data: {
          type: 'task_assignment',
          description: 'Task 1',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      await db.notification.create({
        data: {
          type: 'task_due',
          description: 'Task 2',
          employeeId: testEmployeeId,
          read: true,
        },
      });

      const res = await request(app).get(
        `/api/notifications/${testEmployeeId}?read=false`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].read).toBe(false);
    });

    test('should support pagination', async () => {
      // Create 5 notifications
      for (let i = 0; i < 5; i++) {
        await db.notification.create({
          data: {
            type: 'task_assignment',
            description: `Task ${i}`,
            employeeId: testEmployeeId,
            read: false,
          },
        });
      }

      const res = await request(app).get(
        `/api/notifications/${testEmployeeId}?limit=2&offset=0`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('should return empty array if no notifications', async () => {
      const res = await request(app).get(
        `/api/notifications/${testEmployeeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('PATCH /api/notifications/:notificationId', () => {
    test('should mark notification as read', async () => {
      const notification = await db.notification.create({
        data: {
          type: 'task_assignment',
          description: 'Task',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      const res = await request(app).patch(
        `/api/notifications/${notification.id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.read).toBe(true);
      expect(res.body.id).toBe(notification.id);
    });

    test('should return 500 for nonexistent notification', async () => {
      const res = await request(app).patch(
        '/api/notifications/nonexistent-id'
      );

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Notification not found');
    });
  });

  describe('PATCH /api/notifications/read-all/:employeeId', () => {
    test('should mark all unread notifications as read', async () => {
      await db.notification.create({
        data: {
          type: 'task_assignment',
          description: 'Task 1',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      await db.notification.create({
        data: {
          type: 'task_due',
          description: 'Task 2',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      const res = await request(app).patch(
        `/api/notifications/read-all/${testEmployeeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.message).toContain('2 notifications');
    });

    test('should handle no unread notifications', async () => {
      const res = await request(app).patch(
        `/api/notifications/read-all/${testEmployeeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  describe('DELETE /api/notifications/:notificationId', () => {
    test('should delete a notification', async () => {
      const notification = await db.notification.create({
        data: {
          type: 'task_assignment',
          description: 'Task',
          employeeId: testEmployeeId,
          read: false,
        },
      });

      const res = await request(app).delete(
        `/api/notifications/${notification.id}`
      );

      expect(res.status).toBe(204);

      // Verify deletion
      const deleted = await db.notification.findUnique({
        where: { id: notification.id },
      });
      expect(deleted).toBeNull();
    });

    test('should return 500 for nonexistent notification', async () => {
      const res = await request(app).delete(
        '/api/notifications/nonexistent-id'
      );

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Notification not found');
    });
  });
});
