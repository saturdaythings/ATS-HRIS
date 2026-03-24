import {
  assignDevice,
  returnDevice,
  getAssignmentHistory,
  getEmployeeDevices,
  createDevice,
  listDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from '../../services/deviceService.js';
import { db } from '../../db.js';

/**
 * Comprehensive tests for Device CRUD & Assignment & Management (TASK 7.1-7.5)
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

describe('DeviceService - CRUD & Assignment & Management', () => {
  let testEmployee;
  let testDevice;

  beforeEach(async () => {
    // Clean up test data
    await db.deviceAssignment.deleteMany({});
    await db.device.deleteMany({});
    await db.employee.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  // Helper function to create test employee
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

  // Helper function to create test device
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

  describe('createDevice', () => {
    it('should create a device with required fields', async () => {
      const data = {
        serial: 'UNIQUE-SERIAL-001',
        type: 'laptop',
        make: 'Apple',
        model: 'MacBook Pro 14',
      };

      const device = await createDevice(data);

      expect(device).toBeDefined();
      expect(device.id).toBeDefined();
      expect(device.serial).toBe('UNIQUE-SERIAL-001');
      expect(device.type).toBe('laptop');
      expect(device.make).toBe('Apple');
      expect(device.model).toBe('MacBook Pro 14');
      expect(device.status).toBe('available');
      expect(device.condition).toBe('good');
    });

    it('should allow optional fields', async () => {
      const data = {
        serial: 'SERIAL-002',
        type: 'monitor',
        make: 'Dell',
        model: 'U2720Q',
        condition: 'new',
        warrantyExp: new Date('2028-01-01'),
        notes: 'Refurbished',
      };

      const device = await createDevice(data);

      expect(device.condition).toBe('new');
      expect(device.warrantyExp).toEqual(new Date('2028-01-01'));
      expect(device.notes).toBe('Refurbished');
    });

    it('should prevent duplicate serial numbers', async () => {
      const data = {
        serial: 'DUPLICATE-SERIAL',
        type: 'laptop',
        make: 'Dell',
        model: 'XPS 13',
      };

      await createDevice(data);

      await expect(createDevice(data)).rejects.toThrow();
    });
  });

  describe('listDevices', () => {
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
      const devices = await listDevices({});

      expect(devices.data.length).toBeGreaterThanOrEqual(3);
      expect(devices.total).toBeGreaterThanOrEqual(3);
    });

    it('should filter by type', async () => {
      const devices = await listDevices({ type: 'laptop' });

      expect(devices.data.length).toBe(2);
      expect(devices.data.every(d => d.type === 'laptop')).toBe(true);
    });

    it('should filter by status', async () => {
      const available = await listDevices({ status: 'available' });

      expect(available.data.every(d => d.status === 'available')).toBe(true);
    });

    it('should filter by condition', async () => {
      const good = await listDevices({ condition: 'good' });

      expect(good.data.every(d => d.condition === 'good')).toBe(true);
    });

    it('should sort by serial by default', async () => {
      const devices = await listDevices({});

      const serials = devices.data.map(d => d.serial);
      const sortedSerials = [...serials].sort();

      expect(serials).toEqual(sortedSerials);
    });

    it('should support pagination', async () => {
      const page1 = await listDevices({ limit: 2, offset: 0 });

      expect(page1.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getDeviceById', () => {
    let deviceId;

    beforeEach(async () => {
      const device = await db.device.create({
        data: {
          serial: 'DETAIL-TEST-001',
          type: 'laptop',
          make: 'Apple',
          model: 'MacBook Pro',
          condition: 'good',
          status: 'available',
        }
      });
      deviceId = device.id;
    });

    it('should retrieve device by id', async () => {
      const device = await getDeviceById(deviceId);

      expect(device).toBeDefined();
      expect(device.id).toBe(deviceId);
      expect(device.serial).toBe('DETAIL-TEST-001');
      expect(device.type).toBe('laptop');
    });

    it('should return null for non-existent device', async () => {
      const device = await getDeviceById('nonexistent-id');

      expect(device).toBeNull();
    });
  });

  describe('updateDevice', () => {
    let deviceId;

    beforeEach(async () => {
      const device = await db.device.create({
        data: {
          serial: 'UPDATE-TEST-001',
          type: 'laptop',
          make: 'Apple',
          model: 'MacBook Pro',
          condition: 'good',
          status: 'available',
        }
      });
      deviceId = device.id;
    });

    it('should update device condition', async () => {
      const updated = await updateDevice(deviceId, {
        condition: 'fair',
      });

      expect(updated.condition).toBe('fair');
      expect(updated.serial).toBe('UPDATE-TEST-001');
    });

    it('should update device status', async () => {
      const updated = await updateDevice(deviceId, {
        status: 'assigned',
      });

      expect(updated.status).toBe('assigned');
    });

    it('should not allow serial number update', async () => {
      const updated = await updateDevice(deviceId, {
        serial: 'NEW-SERIAL-999',
      });

      expect(updated.serial).toBe('UPDATE-TEST-001');
    });

    it('should throw error for non-existent device', async () => {
      await expect(updateDevice('nonexistent-id', { condition: 'poor' }))
        .rejects.toThrow();
    });
  });

  describe('deleteDevice', () => {
    let deviceId;

    beforeEach(async () => {
      const device = await db.device.create({
        data: {
          serial: 'DELETE-TEST-001',
          type: 'laptop',
          make: 'Apple',
          model: 'MacBook Pro',
        }
      });
      deviceId = device.id;
    });

    it('should soft delete device by setting status to retired', async () => {
      const deleted = await deleteDevice(deviceId);

      expect(deleted.status).toBe('retired');

      const check = await db.device.findUnique({
        where: { id: deviceId }
      });

      expect(check.status).toBe('retired');
    });

    it('should throw error for non-existent device', async () => {
      await expect(deleteDevice('nonexistent-id'))
        .rejects.toThrow();
    });
  });

  // ==================== TASK 7.4: ASSIGNMENT TESTS ====================

  describe('assignDevice', () => {
    beforeEach(async () => {
      testEmployee = await createTestEmployee();
      testDevice = await createTestDevice();
    });

    test('should assign a device to an employee', async () => {
      const assignedDate = new Date('2025-01-15');
      const assignment = await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
        assignedDate,
        notes: 'New laptop for engineering team',
      });

      expect(assignment).toMatchObject({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
        condition: null,
        returnedDate: null,
      });
      expect(new Date(assignment.assignedDate)).toEqual(assignedDate);
      expect(assignment.notes).toBe('New laptop for engineering team');
    });

    test('should set device status to assigned', async () => {
      const assignment = await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      const device = await db.device.findUnique({ where: { id: testDevice.id } });
      expect(device.status).toBe('assigned');
    });

    test('should use current date if assignedDate not provided', async () => {
      const assignment = await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      expect(assignment.assignedDate).toBeTruthy();
      const timeDiff = Math.abs(new Date() - new Date(assignment.assignedDate));
      expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
    });

    test('should throw error if device not found', async () => {
      await expect(
        assignDevice({
          deviceId: 'non-existent',
          employeeId: testEmployee.id,
        })
      ).rejects.toThrow('Device not found');
    });

    test('should throw error if employee not found', async () => {
      await expect(
        assignDevice({
          deviceId: testDevice.id,
          employeeId: 'non-existent',
        })
      ).rejects.toThrow('Employee not found');
    });

    test('should throw error if trying to assign already assigned device', async () => {
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      const anotherEmployee = await createTestEmployee();

      await expect(
        assignDevice({
          deviceId: testDevice.id,
          employeeId: anotherEmployee.id,
        })
      ).rejects.toThrow('Device is already assigned');
    });

    test('should allow reassignment after return', async () => {
      // First assignment
      const assignment1 = await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      // Return device
      await returnDevice({
        deviceId: testDevice.id,
        returnedDate: new Date(),
        condition: 'good',
      });

      // Reassign to another employee
      const anotherEmployee = await createTestEmployee();
      const assignment2 = await assignDevice({
        deviceId: testDevice.id,
        employeeId: anotherEmployee.id,
      });

      expect(assignment2.employeeId).toBe(anotherEmployee.id);
      expect(assignment2.returnedDate).toBeNull();
    });
  });

  // ==================== TASK 7.4: RETURN TESTS ====================

  describe('returnDevice', () => {
    beforeEach(async () => {
      testEmployee = await createTestEmployee();
      testDevice = await createTestDevice();
    });

    test('should return an assigned device', async () => {
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      const returnedDate = new Date('2025-02-20');
      const updated = await returnDevice({
        deviceId: testDevice.id,
        returnedDate,
        condition: 'good',
        notes: 'Device in good condition',
      });

      expect(updated.returnedDate).toBeTruthy();
      expect(new Date(updated.returnedDate)).toEqual(returnedDate);
      expect(updated.condition).toBe('good');
      expect(updated.notes).toBe('Device in good condition');
    });

    test('should set device status to available after return', async () => {
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      await returnDevice({
        deviceId: testDevice.id,
        returnedDate: new Date(),
        condition: 'good',
      });

      const device = await db.device.findUnique({ where: { id: testDevice.id } });
      expect(device.status).toBe('available');
    });

    test('should update device condition if provided', async () => {
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      await returnDevice({
        deviceId: testDevice.id,
        returnedDate: new Date(),
        condition: 'fair',
      });

      const device = await db.device.findUnique({ where: { id: testDevice.id } });
      expect(device.condition).toBe('fair');
    });

    test('should throw error if device not found', async () => {
      await expect(
        returnDevice({
          deviceId: 'non-existent',
          returnedDate: new Date(),
          condition: 'good',
        })
      ).rejects.toThrow('Device not found');
    });

    test('should throw error if device has no active assignment', async () => {
      await expect(
        returnDevice({
          deviceId: testDevice.id,
          returnedDate: new Date(),
          condition: 'good',
        })
      ).rejects.toThrow('Device has no active assignment');
    });

    test('should accept condition values: new, good, fair, poor', async () => {
      const conditions = ['new', 'good', 'fair', 'poor'];

      for (const condition of conditions) {
        const device = await createTestDevice();
        const employee = await createTestEmployee();

        await assignDevice({
          deviceId: device.id,
          employeeId: employee.id,
        });

        const returned = await returnDevice({
          deviceId: device.id,
          returnedDate: new Date(),
          condition,
        });

        expect(returned.condition).toBe(condition);
      }
    });
  });

  // ==================== TASK 7.4: HISTORY TESTS ====================

  describe('getAssignmentHistory', () => {
    beforeEach(async () => {
      testEmployee = await createTestEmployee();
      testDevice = await createTestDevice();
    });

    test('should return assignment history for a device', async () => {
      const assignment1 = await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2025-01-01'),
      });

      await returnDevice({
        deviceId: testDevice.id,
        returnedDate: new Date('2025-02-01'),
        condition: 'good',
      });

      const anotherEmployee = await createTestEmployee();
      const assignment2 = await assignDevice({
        deviceId: testDevice.id,
        employeeId: anotherEmployee.id,
        assignedDate: new Date('2025-02-02'),
      });

      const history = await getAssignmentHistory(testDevice.id);

      expect(history).toHaveLength(2);
      // History is in descending order by assignedDate
      expect(history[0].employeeId).toBe(anotherEmployee.id);
      expect(history[1].employeeId).toBe(testEmployee.id);
    });

    test('should include device details in history', async () => {
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      const history = await getAssignmentHistory(testDevice.id);

      expect(history[0].device).toBeDefined();
      expect(history[0].device.serial).toBe(testDevice.serial);
      expect(history[0].device.type).toBe(testDevice.type);
    });

    test('should include employee details in history', async () => {
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      const history = await getAssignmentHistory(testDevice.id);

      expect(history[0].employee).toBeDefined();
      expect(history[0].employee.name).toBe(testEmployee.name);
      expect(history[0].employee.email).toBe(testEmployee.email);
    });

    test('should order history by assignedDate descending', async () => {
      const dates = [
        new Date('2025-01-01'),
        new Date('2025-02-01'),
        new Date('2025-03-01'),
      ];

      for (let i = 0; i < 3; i++) {
        if (i > 0) {
          await returnDevice({
            deviceId: testDevice.id,
            returnedDate: new Date(dates[i].getTime() - 1),
            condition: 'good',
          });
        }

        const emp = await createTestEmployee();
        await assignDevice({
          deviceId: testDevice.id,
          employeeId: emp.id,
          assignedDate: dates[i],
        });
      }

      const history = await getAssignmentHistory(testDevice.id);
      expect(new Date(history[0].assignedDate)).toEqual(dates[2]);
      expect(new Date(history[1].assignedDate)).toEqual(dates[1]);
    });

    test('should throw error if device not found', async () => {
      await expect(getAssignmentHistory('non-existent')).rejects.toThrow(
        'Device not found'
      );
    });

    test('should return empty array for device with no assignments', async () => {
      const unassignedDevice = await createTestDevice();
      const history = await getAssignmentHistory(unassignedDevice.id);
      expect(history).toEqual([]);
    });
  });

  // ==================== TASK 7.4: EMPLOYEE DEVICES TESTS ====================

  describe('getEmployeeDevices', () => {
    beforeEach(async () => {
      testEmployee = await createTestEmployee();
    });

    test('should return current and past device assignments for employee', async () => {
      const device1 = await createTestDevice();
      const device2 = await createTestDevice();
      const device3 = await createTestDevice();

      // Device 1: Current assignment
      await assignDevice({
        deviceId: device1.id,
        employeeId: testEmployee.id,
      });

      // Device 2: Past assignment
      await assignDevice({
        deviceId: device2.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2025-01-01'),
      });
      await returnDevice({
        deviceId: device2.id,
        returnedDate: new Date('2025-02-01'),
        condition: 'good',
      });

      // Device 3: Not assigned to this employee
      const otherEmployee = await createTestEmployee();
      await assignDevice({
        deviceId: device3.id,
        employeeId: otherEmployee.id,
      });

      const devices = await getEmployeeDevices(testEmployee.id);

      expect(devices).toHaveLength(2);
      expect(devices.some(d => d.id === device1.id)).toBe(true);
      expect(devices.some(d => d.id === device2.id)).toBe(true);
      expect(devices.some(d => d.id === device3.id)).toBe(false);
    });

    test('should separate current and returned assignments', async () => {
      const currentDevice = await createTestDevice();
      const returnedDevice = await createTestDevice();

      // Current assignment
      await assignDevice({
        deviceId: currentDevice.id,
        employeeId: testEmployee.id,
      });

      // Returned assignment
      await assignDevice({
        deviceId: returnedDevice.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2025-01-01'),
      });
      await returnDevice({
        deviceId: returnedDevice.id,
        returnedDate: new Date('2025-02-01'),
        condition: 'good',
      });

      const result = await getEmployeeDevices(testEmployee.id);

      const current = result.filter(d => !d.assignments[0].returnedDate);
      const returned = result.filter(d => d.assignments[0].returnedDate);

      expect(current).toHaveLength(1);
      expect(returned).toHaveLength(1);
    });

    test('should include full assignment history for each device', async () => {
      const device = await createTestDevice();

      // Assignment 1
      await assignDevice({
        deviceId: device.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2025-01-01'),
      });
      await returnDevice({
        deviceId: device.id,
        returnedDate: new Date('2025-02-01'),
        condition: 'good',
      });

      // Assignment 2
      await assignDevice({
        deviceId: device.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2025-02-02'),
      });

      const result = await getEmployeeDevices(testEmployee.id);
      expect(result).toHaveLength(1);
      expect(result[0].assignments).toHaveLength(2);
    });

    test('should throw error if employee not found', async () => {
      await expect(getEmployeeDevices('non-existent')).rejects.toThrow(
        'Employee not found'
      );
    });

    test('should return empty array for employee with no device assignments', async () => {
      const newEmployee = await createTestEmployee();
      const devices = await getEmployeeDevices(newEmployee.id);
      expect(devices).toEqual([]);
    });
  });

  // ==================== CONSTRAINT TESTS ====================

  describe('Unique Constraint Tests', () => {
    beforeEach(async () => {
      testEmployee = await createTestEmployee();
      testDevice = await createTestDevice();
    });

    test('should enforce only one active assignment per device', async () => {
      // This is handled at the database level with unique constraint
      // (deviceId, returnedDate) where returnedDate IS NULL

      const assignment = await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
      });

      const anotherEmployee = await createTestEmployee();

      // Attempting to assign same device should fail
      await expect(
        assignDevice({
          deviceId: testDevice.id,
          employeeId: anotherEmployee.id,
        })
      ).rejects.toThrow();
    });

    test('should allow multiple assignments if previous is returned', async () => {
      // First employee
      await assignDevice({
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2025-01-01'),
      });

      // Return to pool
      await returnDevice({
        deviceId: testDevice.id,
        returnedDate: new Date('2025-02-01'),
        condition: 'good',
      });

      // Second employee can now use it
      const secondEmployee = await createTestEmployee();
      const assignment = await assignDevice({
        deviceId: testDevice.id,
        employeeId: secondEmployee.id,
        assignedDate: new Date('2025-02-02'),
      });

      expect(assignment.employeeId).toBe(secondEmployee.id);
      expect(assignment.returnedDate).toBeNull();
    });
  });
});
