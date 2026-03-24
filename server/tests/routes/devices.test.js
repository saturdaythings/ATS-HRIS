import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import devicesRouter from '../../routes/devices.js';
import employeesRouter from '../../routes/employees.js';

/**
 * Comprehensive tests for Device CRUD & Assignment & Management API (TASK 7.1-7.5)
 *
 * Task 7.1-7.3: Device CRUD & Inventory API
 * - POST /api/devices (create: serial, type, make, model, condition, warrantyExp, notes)
 * - GET /api/devices (filters: type, status, condition; sort by serial)
 * - GET /api/devices/:id (detail with assignment history)
 * - PATCH /api/devices/:id (update condition, status, notes)
 * - DELETE /api/devices/:id (retire device)
 *
 * Task 7.4-7.5: Device Assignment API
 * - POST /api/devices/:id/assign (body: employeeId, assignedDate, notes)
 * - PATCH /api/devices/:id/return (body: returnedDate, condition, notes)
 * - GET /api/devices/:id/history (assignment history)
 * - GET /api/employees/:id/devices (current assignments + history)
 */

describe('Device CRUD & Assignment API Routes (TASK 7.1-7.5)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/devices', devicesRouter);
    app.use('/api/employees', employeesRouter);
    app.use((err, req, res, next) => {
      console.error('[Test Error]', err.message);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    });
  });

  beforeEach(async () => {
    // Clean up database before each test
    // Must delete in correct order due to foreign keys
    // DeviceAssignment -> Employee/Device relations cascade
    await db.deviceAssignment.deleteMany({});
    // Device -> DeviceAssignment (Restrict) so must delete after assignments
    await db.device.deleteMany({});
    // Employee can be deleted after assignments
    await db.employee.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  // ==================== HELPER FUNCTIONS ====================

  async function createTestEmployee(overrides = {}) {
    return db.employee.create({
      data: {
        name: 'Test Employee',
        email: `emp-${Math.random().toString(36).substr(2, 9)}@example.com`,
        title: 'Engineer',
        status: 'active',
        ...overrides,
      },
    });
  }

  async function createTestDevice(overrides = {}) {
    return db.device.create({
      data: {
        serial: `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        type: 'laptop',
        make: 'Apple',
        model: 'MacBook Pro 16',
        condition: 'new',
        status: 'available',
        ...overrides,
      },
    });
  }

  // ==================== TASK 7.1-7.3: DEVICE CRUD TESTS ====================

  describe('GET /api/devices', () => {
    beforeEach(async () => {
      await db.device.createMany({
        data: [
          {
            serial: 'LAPTOP-001',
            type: 'laptop',
            make: 'Apple',
            model: 'MacBook Pro',
            status: 'available',
            condition: 'good',
          },
          {
            serial: 'LAPTOP-002',
            type: 'laptop',
            make: 'Dell',
            model: 'XPS 13',
            status: 'assigned',
            condition: 'good',
          },
          {
            serial: 'MONITOR-001',
            type: 'monitor',
            make: 'Dell',
            model: 'U2720Q',
            status: 'available',
            condition: 'new',
          },
        ]
      });
    });

    it('should list all devices', async () => {
      const res = await request(app)
        .get('/api/devices')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/devices?type=laptop')
        .expect(200);

      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every(d => d.type === 'laptop')).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/devices?status=available')
        .expect(200);

      expect(res.body.data.every(d => d.status === 'available')).toBe(true);
    });

    it('should apply multiple filters', async () => {
      const res = await request(app)
        .get('/api/devices?type=laptop&status=available')
        .expect(200);

      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/devices', () => {
    it('should create a device', async () => {
      const res = await request(app)
        .post('/api/devices')
        .send({
          serial: 'NEW-SERIAL-001',
          type: 'laptop',
          make: 'Apple',
          model: 'MacBook Pro 14',
          condition: 'new',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.serial).toBe('NEW-SERIAL-001');
      expect(res.body.status).toBe('available');
    });

    it('should return 400 if required fields missing', async () => {
      const res = await request(app)
        .post('/api/devices')
        .send({
          serial: 'INCOMPLETE',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/devices/:id', () => {
    it('should retrieve device details', async () => {
      const device = await createTestDevice();

      const res = await request(app)
        .get(`/api/devices/${device.id}`)
        .expect(200);

      expect(res.body.id).toBe(device.id);
      expect(res.body.serial).toBe(device.serial);
    });

    it('should return 404 for non-existent device', async () => {
      const res = await request(app)
        .get('/api/devices/nonexistent-id')
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/devices/:id', () => {
    it('should update device condition', async () => {
      const device = await createTestDevice();

      const res = await request(app)
        .patch(`/api/devices/${device.id}`)
        .send({ condition: 'fair' })
        .expect(200);

      expect(res.body.condition).toBe('fair');
    });

    it('should return 404 for non-existent device', async () => {
      const res = await request(app)
        .patch('/api/devices/nonexistent-id')
        .send({ condition: 'poor' })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/devices/:id', () => {
    it('should soft delete device', async () => {
      const device = await createTestDevice();

      const res = await request(app)
        .delete(`/api/devices/${device.id}`)
        .expect(200);

      expect(res.body.status).toBe('retired');
    });

    it('should return 404 for non-existent device', async () => {
      const res = await request(app)
        .delete('/api/devices/nonexistent-id')
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== TASK 7.4: ASSIGNMENT TESTS ====================

  describe('POST /api/devices/:id/assign', () => {
    test('should assign a device to an employee', async () => {
      const employee = await createTestEmployee();
      const device = await createTestDevice();

      const res = await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee.id,
          assignedDate: new Date('2025-01-15').toISOString(),
          notes: 'New laptop for engineering team',
        });

      expect(res.status).toBe(201);
      expect(res.body.deviceId).toBe(device.id);
      expect(res.body.employeeId).toBe(employee.id);
      expect(res.body.returnedDate).toBeNull();
      expect(res.body.notes).toBe('New laptop for engineering team');
    });

    test('should use current date if assignedDate not provided', async () => {
      const employee = await createTestEmployee();
      const device = await createTestDevice();

      const res = await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee.id,
        });

      expect(res.status).toBe(201);
      expect(res.body.assignedDate).toBeTruthy();
    });

    test('should return 400 if employeeId not provided', async () => {
      const device = await createTestDevice();

      const res = await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('employeeId');
    });

    test('should return 404 if device not found', async () => {
      const employee = await createTestEmployee();

      const res = await request(app)
        .post(`/api/devices/non-existent/assign`)
        .send({
          employeeId: employee.id,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Device not found');
    });

    test('should return 404 if employee not found', async () => {
      const device = await createTestDevice();

      const res = await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: 'non-existent',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Employee not found');
    });

    test('should return 400 if device already assigned', async () => {
      const employee1 = await createTestEmployee();
      const employee2 = await createTestEmployee();
      const device = await createTestDevice();

      // First assignment
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee1.id,
        });

      // Second assignment should fail
      const res = await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee2.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already assigned');
    });
  });

  // ==================== TASK 7.4: RETURN TESTS ====================

  describe('PATCH /api/devices/:id/return', () => {
    test('should return an assigned device', async () => {
      const employee = await createTestEmployee();
      const device = await createTestDevice();

      // Assign first
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({ employeeId: employee.id });

      // Return
      const returnedDate = new Date('2025-02-20').toISOString();
      const res = await request(app)
        .patch(`/api/devices/${device.id}/return`)
        .send({
          returnedDate,
          condition: 'good',
          notes: 'Device in good condition',
        });

      expect(res.status).toBe(200);
      expect(res.body.returnedDate).toBeTruthy();
      expect(res.body.condition).toBe('good');
      expect(res.body.notes).toBe('Device in good condition');
    });

    test('should accept condition values: new, good, fair, poor', async () => {
      const conditions = ['new', 'good', 'fair', 'poor'];

      for (const condition of conditions) {
        const employee = await createTestEmployee();
        const device = await createTestDevice();

        // Assign
        await request(app)
          .post(`/api/devices/${device.id}/assign`)
          .send({ employeeId: employee.id });

        // Return with condition
        const res = await request(app)
          .patch(`/api/devices/${device.id}/return`)
          .send({
            returnedDate: new Date().toISOString(),
            condition,
          });

        expect(res.status).toBe(200);
        expect(res.body.condition).toBe(condition);
      }
    });

    test('should return 400 if returnedDate not provided', async () => {
      const employee = await createTestEmployee();
      const device = await createTestDevice();

      // Assign first
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({ employeeId: employee.id });

      // Try to return without date
      const res = await request(app)
        .patch(`/api/devices/${device.id}/return`)
        .send({
          condition: 'good',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('returnedDate');
    });

    test('should return 404 if device not found', async () => {
      const res = await request(app)
        .patch(`/api/devices/non-existent/return`)
        .send({
          returnedDate: new Date().toISOString(),
          condition: 'good',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Device not found');
    });

    test('should return 400 if device has no active assignment', async () => {
      const device = await createTestDevice();

      const res = await request(app)
        .patch(`/api/devices/${device.id}/return`)
        .send({
          returnedDate: new Date().toISOString(),
          condition: 'good',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('no active assignment');
    });
  });

  // ==================== TASK 7.4: HISTORY TESTS ====================

  describe('GET /api/devices/:id/history', () => {
    test('should return assignment history for a device', async () => {
      const employee1 = await createTestEmployee();
      const employee2 = await createTestEmployee();
      const device = await createTestDevice();

      // First assignment
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee1.id,
          assignedDate: new Date('2025-01-01').toISOString(),
        });

      // Return
      await request(app)
        .patch(`/api/devices/${device.id}/return`)
        .send({
          returnedDate: new Date('2025-02-01').toISOString(),
          condition: 'good',
        });

      // Second assignment
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee2.id,
          assignedDate: new Date('2025-02-02').toISOString(),
        });

      // Get history
      const res = await request(app).get(`/api/devices/${device.id}/history`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].employeeId).toBe(employee2.id); // Most recent first
      expect(res.body[1].employeeId).toBe(employee1.id);
    });

    test('should include device and employee details', async () => {
      const employee = await createTestEmployee();
      const device = await createTestDevice();

      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({ employeeId: employee.id });

      const res = await request(app).get(`/api/devices/${device.id}/history`);

      expect(res.status).toBe(200);
      expect(res.body[0].device).toBeDefined();
      expect(res.body[0].device.serial).toBe(device.serial);
      expect(res.body[0].employee).toBeDefined();
      expect(res.body[0].employee.name).toBe(employee.name);
    });

    test('should return 404 if device not found', async () => {
      const res = await request(app).get(`/api/devices/non-existent/history`);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Device not found');
    });

    test('should return empty array for device with no assignments', async () => {
      const device = await createTestDevice();

      const res = await request(app).get(`/api/devices/${device.id}/history`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ==================== TASK 7.4: EMPLOYEE DEVICES TESTS ====================

  describe('GET /api/employees/:id/devices', () => {
    test('should return all devices assigned to an employee', async () => {
      const employee = await createTestEmployee();
      const device1 = await createTestDevice();
      const device2 = await createTestDevice();

      // Current assignment
      await request(app)
        .post(`/api/devices/${device1.id}/assign`)
        .send({ employeeId: employee.id });

      // Past assignment
      await request(app)
        .post(`/api/devices/${device2.id}/assign`)
        .send({
          employeeId: employee.id,
          assignedDate: new Date('2025-01-01').toISOString(),
        });
      await request(app)
        .patch(`/api/devices/${device2.id}/return`)
        .send({
          returnedDate: new Date('2025-02-01').toISOString(),
          condition: 'good',
        });

      // Get employee's devices
      const res = await request(app).get(`/api/employees/${employee.id}/devices`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.some(d => d.id === device1.id)).toBe(true);
      expect(res.body.some(d => d.id === device2.id)).toBe(true);
    });

    test('should include full assignment history for each device', async () => {
      const employee = await createTestEmployee();
      const device = await createTestDevice();

      // First assignment
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee.id,
          assignedDate: new Date('2025-01-01').toISOString(),
        });

      // Return
      await request(app)
        .patch(`/api/devices/${device.id}/return`)
        .send({
          returnedDate: new Date('2025-02-01').toISOString(),
          condition: 'good',
        });

      // Second assignment
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({
          employeeId: employee.id,
          assignedDate: new Date('2025-02-02').toISOString(),
        });

      // Get employee's devices
      const res = await request(app).get(`/api/employees/${employee.id}/devices`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].assignments).toHaveLength(2);
    });

    test('should return 404 if employee not found', async () => {
      const res = await request(app).get(`/api/employees/non-existent/devices`);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Employee not found');
    });

    test('should return empty array for employee with no device assignments', async () => {
      const employee = await createTestEmployee();

      const res = await request(app).get(`/api/employees/${employee.id}/devices`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('should not include devices assigned to other employees', async () => {
      const employee1 = await createTestEmployee();
      const employee2 = await createTestEmployee();
      const device = await createTestDevice();

      // Assign to employee2
      await request(app)
        .post(`/api/devices/${device.id}/assign`)
        .send({ employeeId: employee2.id });

      // Check employee1's devices
      const res = await request(app).get(`/api/employees/${employee1.id}/devices`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
