import {
  createNotification,
  getNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  validateNotificationType,
} from '../../services/notificationService.js';
import { db } from '../../db.js';

describe('NotificationService', () => {
  let testEmployeeId;

  beforeAll(async () => {
    // Create a test employee
    const employee = await db.employee.create({
      data: {
        name: 'Test Employee',
        email: 'test@example.com',
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

  describe('createNotification', () => {
    test('should create a task_assignment notification', async () => {
      const notification = await createNotification(
        'task_assignment',
        'You have been assigned a new onboarding task',
        testEmployeeId
      );

      expect(notification.id).toBeDefined();
      expect(notification.type).toBe('task_assignment');
      expect(notification.description).toBe('You have been assigned a new onboarding task');
      expect(notification.employeeId).toBe(testEmployeeId);
      expect(notification.read).toBe(false);
      expect(notification.createdAt).toBeDefined();
    });

    test('should create a task_due notification', async () => {
      const notification = await createNotification(
        'task_due',
        'Your onboarding task is due today',
        testEmployeeId
      );

      expect(notification.type).toBe('task_due');
      expect(notification.read).toBe(false);
    });

    test('should create a task_overdue notification', async () => {
      const notification = await createNotification(
        'task_overdue',
        'Your onboarding task is overdue',
        testEmployeeId
      );

      expect(notification.type).toBe('task_overdue');
    });

    test('should create an employee_hired notification', async () => {
      const notification = await createNotification(
        'employee_hired',
        'Welcome to the team!',
        testEmployeeId
      );

      expect(notification.type).toBe('employee_hired');
    });

    test('should create a completion notification', async () => {
      const notification = await createNotification(
        'completion',
        'You have completed your onboarding checklist',
        testEmployeeId
      );

      expect(notification.type).toBe('completion');
    });

    test('should create a device_assigned notification', async () => {
      const notification = await createNotification(
        'device_assigned',
        'A laptop has been assigned to you',
        testEmployeeId
      );

      expect(notification.type).toBe('device_assigned');
    });

    test('should throw error for invalid notification type', async () => {
      await expect(
        createNotification('invalid_type', 'Test', testEmployeeId)
      ).rejects.toThrow('Invalid notification type');
    });

    test('should throw error if type is missing', async () => {
      await expect(
        createNotification(null, 'Test', testEmployeeId)
      ).rejects.toThrow('Notification type is required');
    });

    test('should throw error if description is missing', async () => {
      await expect(
        createNotification('task_assignment', null, testEmployeeId)
      ).rejects.toThrow('Description is required');
    });

    test('should throw error if employeeId is missing', async () => {
      await expect(
        createNotification('task_assignment', 'Test', null)
      ).rejects.toThrow('Employee ID is required');
    });

    test('should throw error if employee does not exist', async () => {
      await expect(
        createNotification('task_assignment', 'Test', 'nonexistent-id')
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('getNotification', () => {
    test('should get notification by id', async () => {
      const created = await createNotification(
        'task_assignment',
        'Test notification',
        testEmployeeId
      );

      const notification = await getNotification(created.id);

      expect(notification.id).toBe(created.id);
      expect(notification.type).toBe('task_assignment');
      expect(notification.description).toBe('Test notification');
    });

    test('should throw error if notification not found', async () => {
      await expect(getNotification('nonexistent-id')).rejects.toThrow(
        'Notification not found'
      );
    });
  });

  describe('listNotifications', () => {
    test('should list all notifications for an employee', async () => {
      await createNotification('task_assignment', 'Task 1', testEmployeeId);
      await createNotification('task_due', 'Task 2', testEmployeeId);
      await createNotification('task_overdue', 'Task 3', testEmployeeId);

      const notifications = await listNotifications(testEmployeeId);

      expect(notifications).toHaveLength(3);
      expect(notifications[0].employeeId).toBe(testEmployeeId);
    });

    test('should order notifications by createdAt DESC (newest first)', async () => {
      const n1 = await createNotification('task_assignment', 'Task 1', testEmployeeId);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const n2 = await createNotification('task_due', 'Task 2', testEmployeeId);

      const notifications = await listNotifications(testEmployeeId);

      expect(notifications[0].id).toBe(n2.id);
      expect(notifications[1].id).toBe(n1.id);
    });

    test('should show unread notifications first', async () => {
      const n1 = await createNotification('task_assignment', 'Task 1', testEmployeeId);
      const n2 = await createNotification('task_due', 'Task 2', testEmployeeId);

      // Mark first as read
      await markAsRead(n1.id);

      const notifications = await listNotifications(testEmployeeId);

      // Unread should come first
      expect(notifications[0].read).toBe(false);
      expect(notifications[0].id).toBe(n2.id);
      expect(notifications[1].read).toBe(true);
      expect(notifications[1].id).toBe(n1.id);
    });

    test('should support pagination with limit', async () => {
      // Create 5 notifications
      for (let i = 0; i < 5; i++) {
        await createNotification('task_assignment', `Task ${i}`, testEmployeeId);
      }

      const notifications = await listNotifications(testEmployeeId, {
        limit: 2,
        offset: 0,
      });

      expect(notifications).toHaveLength(2);
    });

    test('should support pagination with offset', async () => {
      // Create 5 notifications
      for (let i = 0; i < 5; i++) {
        await createNotification('task_assignment', `Task ${i}`, testEmployeeId);
      }

      const page1 = await listNotifications(testEmployeeId, {
        limit: 2,
        offset: 0,
      });

      const page2 = await listNotifications(testEmployeeId, {
        limit: 2,
        offset: 2,
      });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    test('should filter by read status (unread)', async () => {
      const n1 = await createNotification('task_assignment', 'Task 1', testEmployeeId);
      const n2 = await createNotification('task_due', 'Task 2', testEmployeeId);

      await markAsRead(n1.id);

      const unread = await listNotifications(testEmployeeId, { read: false });

      expect(unread).toHaveLength(1);
      expect(unread[0].id).toBe(n2.id);
      expect(unread[0].read).toBe(false);
    });

    test('should filter by read status (read)', async () => {
      const n1 = await createNotification('task_assignment', 'Task 1', testEmployeeId);
      const n2 = await createNotification('task_due', 'Task 2', testEmployeeId);

      await markAsRead(n1.id);

      const readNotifications = await listNotifications(testEmployeeId, { read: true });

      expect(readNotifications).toHaveLength(1);
      expect(readNotifications[0].id).toBe(n1.id);
      expect(readNotifications[0].read).toBe(true);
    });

    test('should return empty array if no notifications exist', async () => {
      const notifications = await listNotifications(testEmployeeId);

      expect(notifications).toEqual([]);
    });

    test('should use default pagination limits', async () => {
      // Create 50 notifications
      for (let i = 0; i < 50; i++) {
        await createNotification('task_assignment', `Task ${i}`, testEmployeeId);
      }

      const notifications = await listNotifications(testEmployeeId);

      // Default limit is 25
      expect(notifications.length).toBe(25);
    });
  });

  describe('markAsRead', () => {
    test('should mark notification as read', async () => {
      const created = await createNotification(
        'task_assignment',
        'Test',
        testEmployeeId
      );

      expect(created.read).toBe(false);

      const updated = await markAsRead(created.id);

      expect(updated.read).toBe(true);
      expect(updated.id).toBe(created.id);
    });

    test('should throw error if notification not found', async () => {
      await expect(markAsRead('nonexistent-id')).rejects.toThrow(
        'Notification not found'
      );
    });
  });

  describe('markAllAsRead', () => {
    test('should mark all notifications as read for an employee', async () => {
      await createNotification('task_assignment', 'Task 1', testEmployeeId);
      await createNotification('task_due', 'Task 2', testEmployeeId);
      await createNotification('task_overdue', 'Task 3', testEmployeeId);

      const result = await markAllAsRead(testEmployeeId);

      expect(result.count).toBe(3);

      const notifications = await listNotifications(testEmployeeId);
      expect(notifications.every(n => n.read === true)).toBe(true);
    });

    test('should handle empty notification list', async () => {
      const result = await markAllAsRead(testEmployeeId);

      expect(result.count).toBe(0);
    });

    test('should only mark unread notifications', async () => {
      const n1 = await createNotification('task_assignment', 'Task 1', testEmployeeId);
      const n2 = await createNotification('task_due', 'Task 2', testEmployeeId);

      await markAsRead(n1.id);

      const result = await markAllAsRead(testEmployeeId);

      // Should mark the one unread notification
      expect(result.count).toBe(1);
    });
  });

  describe('deleteNotification', () => {
    test('should delete a notification', async () => {
      const created = await createNotification(
        'task_assignment',
        'Test',
        testEmployeeId
      );

      await deleteNotification(created.id);

      await expect(getNotification(created.id)).rejects.toThrow(
        'Notification not found'
      );
    });

    test('should throw error if notification not found', async () => {
      await expect(deleteNotification('nonexistent-id')).rejects.toThrow(
        'Notification not found'
      );
    });
  });

  describe('validateNotificationType', () => {
    test('should validate task_assignment type', () => {
      expect(() => validateNotificationType('task_assignment')).not.toThrow();
    });

    test('should validate task_due type', () => {
      expect(() => validateNotificationType('task_due')).not.toThrow();
    });

    test('should validate task_overdue type', () => {
      expect(() => validateNotificationType('task_overdue')).not.toThrow();
    });

    test('should validate employee_hired type', () => {
      expect(() => validateNotificationType('employee_hired')).not.toThrow();
    });

    test('should validate completion type', () => {
      expect(() => validateNotificationType('completion')).not.toThrow();
    });

    test('should validate device_assigned type', () => {
      expect(() => validateNotificationType('device_assigned')).not.toThrow();
    });

    test('should throw error for invalid type', () => {
      expect(() => validateNotificationType('invalid_type')).toThrow(
        'Invalid notification type'
      );
    });

    test('should throw error for null type', () => {
      expect(() => validateNotificationType(null)).toThrow(
        'Invalid notification type'
      );
    });
  });
});
