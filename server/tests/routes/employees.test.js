import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import employeesRouter from '../../routes/employees.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/employees', employeesRouter);
app.use(errorHandler);

describe('Employees Routes', () => {
  let testEmployeeId;
  let testClient;

  beforeAll(async () => {
    testClient = await prisma.client.create({
      data: { name: 'Test Client' }
    });
  });

  beforeEach(async () => {
    await prisma.employee.deleteMany({});
  });

  afterAll(async () => {
    await prisma.employee.deleteMany({});
    if (testClient) {
      await prisma.client.deleteMany({ where: { id: testClient.id } });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/employees', () => {
    beforeEach(async () => {
      await prisma.employee.createMany({
        data: [
          {
            name: 'Alice Engineering',
            email: 'alice@example.com',
            title: 'Engineer',
            department: 'Engineering',
            status: 'active',
          },
          {
            name: 'Bob Engineering',
            email: 'bob@example.com',
            title: 'Senior Engineer',
            department: 'Engineering',
            status: 'active',
          },
          {
            name: 'Charlie Product',
            email: 'charlie@example.com',
            title: 'PM',
            department: 'Product',
            status: 'active',
          },
          {
            name: 'Diana Sales',
            email: 'diana@example.com',
            title: 'SDR',
            department: 'Sales',
            status: 'offboarded',
          },
        ]
      });
    });

    it('should list all employees', async () => {
      const res = await request(app)
        .get('/api/employees')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      expect(res.body.total).toBeGreaterThanOrEqual(4);
    });

    it('should filter by department', async () => {
      const res = await request(app)
        .get('/api/employees?department=Engineering')
        .expect(200);

      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every(e => e.department === 'Engineering')).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/employees?status=active')
        .expect(200);

      expect(res.body.data.every(e => e.status === 'active')).toBe(true);

      const offboardedRes = await request(app)
        .get('/api/employees?status=offboarded')
        .expect(200);

      expect(offboardedRes.body.data.every(e => e.status === 'offboarded')).toBe(true);
    });

    it('should apply multiple filters', async () => {
      const res = await request(app)
        .get('/api/employees?department=Engineering&status=active')
        .expect(200);

      expect(res.body.data.length).toBe(2);
    });

    it('should sort by name by default', async () => {
      const res = await request(app)
        .get('/api/employees')
        .expect(200);

      const names = res.body.data.map(e => e.name);
      const sortedNames = [...names].sort();

      expect(names).toEqual(sortedNames);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/employees?limit=2&offset=0')
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.limit).toBe(2);
      expect(res.body.offset).toBe(0);
    });
  });

  describe('POST /api/employees', () => {
    it('should create an employee', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          title: 'Software Engineer',
          department: 'Engineering',
          startDate: new Date('2026-01-15'),
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john@example.com');
      expect(res.body.status).toBe('active');
      testEmployeeId = res.body.id;
    });

    it('should return 400 if required fields missing', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          name: 'John Doe',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should prevent duplicate emails', async () => {
      await request(app)
        .post('/api/employees')
        .send({
          name: 'Employee One',
          email: 'duplicate@example.com',
          title: 'Engineer',
        })
        .expect(201);

      const res = await request(app)
        .post('/api/employees')
        .send({
          name: 'Employee Two',
          email: 'duplicate@example.com',
          title: 'Developer',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/employees/:id', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await prisma.employee.create({
        data: {
          name: 'Test Employee',
          email: 'test@example.com',
          title: 'Engineer',
          department: 'Engineering',
        }
      });
      employeeId = employee.id;
    });

    it('should retrieve employee details', async () => {
      const res = await request(app)
        .get(`/api/employees/${employeeId}`)
        .expect(200);

      expect(res.body.id).toBe(employeeId);
      expect(res.body.name).toBe('Test Employee');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.assignments).toBeDefined();
      expect(res.body.onboardingRuns).toBeDefined();
    });

    it('should include current device assignments', async () => {
      const device = await prisma.device.create({
        data: {
          serial: 'TEST-SERIAL-001',
          type: 'laptop',
          make: 'Apple',
          model: 'MacBook Pro',
        }
      });

      await prisma.deviceAssignment.create({
        data: {
          deviceId: device.id,
          employeeId: employeeId,
        }
      });

      const res = await request(app)
        .get(`/api/employees/${employeeId}`)
        .expect(200);

      expect(res.body.assignments.length).toBe(1);
      expect(res.body.assignments[0].device.serial).toBe('TEST-SERIAL-001');
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app)
        .get('/api/employees/nonexistent-id')
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/employees/:id', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await prisma.employee.create({
        data: {
          name: 'Original Name',
          email: 'original@example.com',
          title: 'Engineer',
          department: 'Engineering',
          status: 'active',
        }
      });
      employeeId = employee.id;
    });

    it('should update employee title', async () => {
      const res = await request(app)
        .patch(`/api/employees/${employeeId}`)
        .send({ title: 'Senior Engineer' })
        .expect(200);

      expect(res.body.title).toBe('Senior Engineer');
      expect(res.body.name).toBe('Original Name');
    });

    it('should update employee department', async () => {
      const res = await request(app)
        .patch(`/api/employees/${employeeId}`)
        .send({ department: 'Management' })
        .expect(200);

      expect(res.body.department).toBe('Management');
    });

    it('should update employee status', async () => {
      const res = await request(app)
        .patch(`/api/employees/${employeeId}`)
        .send({ status: 'offboarded' })
        .expect(200);

      expect(res.body.status).toBe('offboarded');
    });

    it('should update multiple fields', async () => {
      const res = await request(app)
        .patch(`/api/employees/${employeeId}`)
        .send({
          title: 'VP Engineering',
          department: 'Leadership',
          status: 'offboarded',
        })
        .expect(200);

      expect(res.body.title).toBe('VP Engineering');
      expect(res.body.department).toBe('Leadership');
      expect(res.body.status).toBe('offboarded');
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app)
        .patch('/api/employees/nonexistent-id')
        .send({ title: 'New Title' })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/employees/:id', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await prisma.employee.create({
        data: {
          name: 'To Offboard',
          email: 'offboard@example.com',
          title: 'Engineer',
          status: 'active',
        }
      });
      employeeId = employee.id;
    });

    it('should soft delete employee by setting status to offboarded', async () => {
      const res = await request(app)
        .delete(`/api/employees/${employeeId}`)
        .expect(200);

      expect(res.body.status).toBe('offboarded');

      const check = await prisma.employee.findUnique({
        where: { id: employeeId }
      });

      expect(check.status).toBe('offboarded');
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app)
        .delete('/api/employees/nonexistent-id')
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });
});
