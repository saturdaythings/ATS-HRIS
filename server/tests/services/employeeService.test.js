import {
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  createEmployee,
} from '../../services/employeeService.js';
import { db } from '../../db.js';

describe('EmployeeService', () => {
  let testEmployeeId;
  let testClient;

  beforeAll(async () => {
    // Create a test client
    testClient = await db.client.create({
      data: {
        name: 'Test Client',
      }
    });
  });

  beforeEach(async () => {
    // Clean up test employees
    await db.employee.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await db.employee.deleteMany({});
    if (testClient) {
      await db.client.deleteMany({
        where: { id: testClient.id }
      });
    }
  });

  describe('createEmployee', () => {
    it('should create an employee with required fields', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        title: 'Software Engineer',
        department: 'Engineering',
        startDate: new Date('2026-01-15'),
      };

      const employee = await createEmployee(data);

      expect(employee).toBeDefined();
      expect(employee.id).toBeDefined();
      expect(employee.name).toBe('John Doe');
      expect(employee.email).toBe('john@example.com');
      expect(employee.title).toBe('Software Engineer');
      expect(employee.department).toBe('Engineering');
      expect(employee.status).toBe('active');
      testEmployeeId = employee.id;
    });

    it('should default status to active', async () => {
      const data = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        title: 'Product Manager',
        department: 'Product',
      };

      const employee = await createEmployee(data);

      expect(employee.status).toBe('active');
    });

    it('should handle optional fields', async () => {
      const data = {
        name: 'Bob Smith',
        email: 'bob@example.com',
        title: 'Designer',
      };

      const employee = await createEmployee(data);

      expect(employee.id).toBeDefined();
      expect(employee.department).toBeNull();
      expect(employee.startDate).toBeNull();
    });

    it('should prevent duplicate email', async () => {
      const data1 = {
        name: 'Employee One',
        email: 'duplicate@example.com',
        title: 'Engineer',
      };

      await createEmployee(data1);

      const data2 = {
        name: 'Employee Two',
        email: 'duplicate@example.com',
        title: 'Developer',
      };

      await expect(createEmployee(data2)).rejects.toThrow();
    });
  });

  describe('listEmployees', () => {
    beforeEach(async () => {
      // Create test employees
      await db.employee.createMany({
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
      const employees = await listEmployees({});

      expect(employees.data.length).toBeGreaterThanOrEqual(4);
      expect(employees.total).toBeGreaterThanOrEqual(4);
    });

    it('should filter by department', async () => {
      const employees = await listEmployees({ department: 'Engineering' });

      expect(employees.data.length).toBe(2);
      expect(employees.data.every(e => e.department === 'Engineering')).toBe(true);
    });

    it('should filter by status', async () => {
      const activeEmployees = await listEmployees({ status: 'active' });

      expect(activeEmployees.data.length).toBe(3);
      expect(activeEmployees.data.every(e => e.status === 'active')).toBe(true);

      const offboardedEmployees = await listEmployees({ status: 'offboarded' });

      expect(offboardedEmployees.data.length).toBe(1);
      expect(offboardedEmployees.data[0].status).toBe('offboarded');
    });

    it('should apply multiple filters', async () => {
      const employees = await listEmployees({
        department: 'Engineering',
        status: 'active'
      });

      expect(employees.data.length).toBe(2);
      expect(employees.data.every(e => e.department === 'Engineering' && e.status === 'active')).toBe(true);
    });

    it('should sort by name ascending by default', async () => {
      const employees = await listEmployees({});

      const names = employees.data.map(e => e.name);
      const sortedNames = [...names].sort();

      expect(names).toEqual(sortedNames);
    });

    it('should sort by startDate', async () => {
      await db.employee.deleteMany({});
      await db.employee.createMany({
        data: [
          {
            name: 'Early Bird',
            email: 'early@example.com',
            title: 'Engineer',
            startDate: new Date('2024-01-01'),
          },
          {
            name: 'Late Comer',
            email: 'late@example.com',
            title: 'Designer',
            startDate: new Date('2026-03-01'),
          },
          {
            name: 'Middle Person',
            email: 'middle@example.com',
            title: 'PM',
            startDate: new Date('2025-06-15'),
          },
        ]
      });

      const employees = await listEmployees({ sortBy: 'startDate' });

      const dates = employees.data.map(e => e.startDate);
      const sortedDates = [...dates].sort((a, b) => a - b);

      expect(dates).toEqual(sortedDates);
    });

    it('should support pagination', async () => {
      const page1 = await listEmployees({ limit: 2, offset: 0 });

      expect(page1.data.length).toBeLessThanOrEqual(2);

      const page2 = await listEmployees({ limit: 2, offset: 2 });

      expect(page2.data).toBeDefined();
    });
  });

  describe('getEmployeeById', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await db.employee.create({
        data: {
          name: 'Test Employee',
          email: 'test@example.com',
          title: 'Engineer',
          department: 'Engineering',
        }
      });
      employeeId = employee.id;
    });

    it('should retrieve employee by id', async () => {
      const employee = await getEmployeeById(employeeId);

      expect(employee).toBeDefined();
      expect(employee.id).toBe(employeeId);
      expect(employee.name).toBe('Test Employee');
      expect(employee.email).toBe('test@example.com');
    });

    it('should include current device assignments', async () => {
      // Create and assign a device
      const device = await db.device.create({
        data: {
          serial: 'TEST123',
          type: 'laptop',
          make: 'Apple',
          model: 'MacBook Pro',
        }
      });

      await db.deviceAssignment.create({
        data: {
          deviceId: device.id,
          employeeId: employeeId,
          assignedDate: new Date(),
        }
      });

      const employee = await getEmployeeById(employeeId);

      expect(employee.assignments).toBeDefined();
      expect(employee.assignments.length).toBe(1);
      expect(employee.assignments[0].device.serial).toBe('TEST123');
    });

    it('should include onboarding/offboarding runs', async () => {
      // Create a track template
      const track = await db.trackTemplate.create({
        data: {
          name: 'Onboarding Template',
          type: 'company',
        }
      });

      // Create an onboarding run
      const run = await db.onboardingRun.create({
        data: {
          employeeId: employeeId,
          type: 'onboarding',
          status: 'in_progress',
          trackId: track.id,
        }
      });

      const employee = await getEmployeeById(employeeId);

      expect(employee.onboardingRuns).toBeDefined();
      expect(employee.onboardingRuns.length).toBeGreaterThanOrEqual(1);
    });

    it('should return null for non-existent employee', async () => {
      const employee = await getEmployeeById('nonexistent-id');

      expect(employee).toBeNull();
    });
  });

  describe('updateEmployee', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await db.employee.create({
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
      const updated = await updateEmployee(employeeId, {
        title: 'Senior Engineer',
      });

      expect(updated.title).toBe('Senior Engineer');
      expect(updated.name).toBe('Original Name');
    });

    it('should update employee department', async () => {
      const updated = await updateEmployee(employeeId, {
        department: 'Management',
      });

      expect(updated.department).toBe('Management');
    });

    it('should update employee status', async () => {
      const updated = await updateEmployee(employeeId, {
        status: 'offboarded',
      });

      expect(updated.status).toBe('offboarded');
    });

    it('should update multiple fields at once', async () => {
      const updated = await updateEmployee(employeeId, {
        title: 'VP Engineering',
        department: 'Leadership',
        status: 'offboarded',
      });

      expect(updated.title).toBe('VP Engineering');
      expect(updated.department).toBe('Leadership');
      expect(updated.status).toBe('offboarded');
    });

    it('should not allow email update', async () => {
      const updated = await updateEmployee(employeeId, {
        email: 'newemail@example.com',
      });

      // Email should not change
      expect(updated.email).toBe('original@example.com');
    });

    it('should preserve other fields when updating', async () => {
      const updated = await updateEmployee(employeeId, {
        title: 'New Title',
      });

      expect(updated.name).toBe('Original Name');
      expect(updated.department).toBe('Engineering');
      expect(updated.status).toBe('active');
    });

    it('should throw error for non-existent employee', async () => {
      await expect(updateEmployee('nonexistent-id', { title: 'New Title' }))
        .rejects.toThrow();
    });
  });

  describe('deleteEmployee', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await db.employee.create({
        data: {
          name: 'To Delete',
          email: 'delete@example.com',
          title: 'Engineer',
        }
      });
      employeeId = employee.id;
    });

    it('should soft delete employee by setting status to offboarded', async () => {
      const deleted = await deleteEmployee(employeeId);

      expect(deleted.status).toBe('offboarded');
      expect(deleted.id).toBe(employeeId);

      // Verify employee still exists in DB with offboarded status
      const check = await db.employee.findUnique({
        where: { id: employeeId }
      });

      expect(check.status).toBe('offboarded');
    });

    it('should throw error for non-existent employee', async () => {
      await expect(deleteEmployee('nonexistent-id'))
        .rejects.toThrow();
    });
  });
});
