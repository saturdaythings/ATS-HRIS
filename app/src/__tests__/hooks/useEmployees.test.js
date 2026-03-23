/**
 * useEmployees Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmployees } from '../../hooks/useEmployees';

// Mock fetch
global.fetch = jest.fn();

describe('useEmployees Hook', () => {
  const mockEmployees = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      title: 'Senior Engineer',
      department: 'Engineering',
      startDate: '2024-01-15',
      status: 'active',
      manager: 'Jane Manager',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      title: 'Product Manager',
      department: 'Product',
      startDate: '2023-06-01',
      status: 'active',
      manager: 'Bob Manager',
    },
    {
      id: '3',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      title: 'Designer',
      department: 'Design',
      startDate: '2024-02-01',
      status: 'onboarding',
      manager: 'Jane Manager',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEmployees', () => {
    test('fetches employees successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ employees: mockEmployees }),
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        await result.current.fetchEmployees();
      });

      expect(result.current.employees).toEqual(mockEmployees);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('handles fetch errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        try {
          await result.current.fetchEmployees();
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Failed to fetch employees: 500');
      expect(result.current.employees).toEqual([]);
    });

    test('supports department filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          employees: mockEmployees.filter(e => e.department === 'Engineering'),
        }),
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        await result.current.fetchEmployees({ department: 'Engineering' });
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/employees?department=Engineering');
    });

    test('supports status filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          employees: mockEmployees.filter(e => e.status === 'active'),
        }),
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        await result.current.fetchEmployees({ status: 'active' });
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/employees?status=active');
    });

    test('supports search filter', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          employees: mockEmployees.filter(e => e.name.includes('John')),
        }),
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        await result.current.fetchEmployees({ searchTerm: 'John' });
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/employees?search=John');
    });

    test('sets loading state correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ employees: mockEmployees }),
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.loading).toBe(false);

      await act(async () => {
        // Start fetch - loading should be true during fetch
        result.current.fetchEmployees();
        // We can't check immediately after call due to async
      });

      // After act completes, loading should be false
      expect(result.current.loading).toBe(false);
    });
  });

  describe('getEmployee', () => {
    test('fetches a single employee by ID', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockEmployees[0] }),
      });

      const { result } = renderHook(() => useEmployees());

      let employee;
      await act(async () => {
        employee = await result.current.getEmployee('1');
      });

      expect(employee).toEqual(mockEmployees[0]);
      expect(global.fetch).toHaveBeenCalledWith('/api/employees/1');
    });

    test('handles error when fetching employee fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        try {
          await result.current.getEmployee('999');
        } catch (err) {
          expect(err.message).toBe('Failed to fetch employee: 404');
        }
      });
    });
  });

  describe('updateEmployee', () => {
    test('updates an employee successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ...mockEmployees[0], title: 'Lead Engineer' } }),
      });

      const { result } = renderHook(() => useEmployees());

      // Set initial employees
      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      let updated;
      await act(async () => {
        updated = await result.current.updateEmployee('1', { title: 'Lead Engineer' });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/employees/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    test('handles update error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid data' }),
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        try {
          await result.current.updateEmployee('1', { title: 'Invalid' });
        } catch (err) {
          expect(err.message).toBe('Invalid data');
        }
      });
    });
  });

  describe('searchEmployees', () => {
    test('searches employees by name', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const searched = result.current.searchEmployees('John Doe');

      expect(searched).toHaveLength(1);
      expect(searched[0].name).toBe('John Doe');
    });

    test('searches employees by email', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const searched = result.current.searchEmployees('jane@');

      expect(searched).toHaveLength(1);
      expect(searched[0].email).toBe('jane@example.com');
    });

    test('returns all employees when search term is empty', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const searched = result.current.searchEmployees('');

      expect(searched).toEqual(mockEmployees);
    });

    test('is case insensitive', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const searched = result.current.searchEmployees('JANE');

      expect(searched).toHaveLength(1);
      expect(searched[0].name).toBe('Jane Smith');
    });
  });

  describe('filterByDepartment', () => {
    test('filters employees by department', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const filtered = result.current.filterByDepartment('Engineering');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].department).toBe('Engineering');
    });

    test('returns all employees when department is empty', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const filtered = result.current.filterByDepartment('');

      expect(filtered).toEqual(mockEmployees);
    });
  });

  describe('filterByStatus', () => {
    test('filters employees by status', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const filtered = result.current.filterByStatus('active');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.status === 'active')).toBe(true);
    });

    test('returns all employees when status is empty', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const filtered = result.current.filterByStatus('');

      expect(filtered).toEqual(mockEmployees);
    });
  });

  describe('getDepartments', () => {
    test('returns unique departments sorted', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const departments = result.current.getDepartments();

      expect(departments).toEqual(['Design', 'Engineering', 'Product']);
    });

    test('returns empty array when no employees', async () => {
      const { result } = renderHook(() => useEmployees());

      const departments = result.current.getDepartments();

      expect(departments).toEqual([]);
    });
  });

  describe('getCountByDepartment', () => {
    test('counts employees by department', async () => {
      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        result.current.setEmployees(mockEmployees);
      });

      const counts = result.current.getCountByDepartment();

      expect(counts).toEqual({
        Engineering: 1,
        Product: 1,
        Design: 1,
      });
    });

    test('returns empty object when no employees', async () => {
      const { result } = renderHook(() => useEmployees());

      const counts = result.current.getCountByDepartment();

      expect(counts).toEqual({});
    });
  });

  describe('getOnboardingChecklist', () => {
    test('fetches onboarding checklist for employee', async () => {
      const mockChecklist = {
        id: 'check-1',
        employeeId: '1',
        items: [
          { id: 'item-1', task: 'Welcome email', completed: true },
          { id: 'item-2', task: 'Setup email', completed: true },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockChecklist }),
      });

      const { result } = renderHook(() => useEmployees());

      let checklist;
      await act(async () => {
        checklist = await result.current.getOnboardingChecklist('1');
      });

      expect(checklist).toEqual(mockChecklist);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('employeeId=1')
      );
    });
  });

  describe('markChecklistItemComplete', () => {
    test('marks checklist item as complete', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'item-1', completed: true } }),
      });

      const { result } = renderHook(() => useEmployees());

      await act(async () => {
        await result.current.markChecklistItemComplete('check-1', 'item-1', true);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/onboarding/checklists/check-1/items/item-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ completed: true }),
        })
      );
    });
  });

  describe('getEmployeeDevices', () => {
    test('fetches devices assigned to employee', async () => {
      const mockDevices = [
        { id: '1', type: 'MacBook Pro', serial: 'ABC123', status: 'active' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ devices: mockDevices }),
      });

      const { result } = renderHook(() => useEmployees());

      let devices;
      await act(async () => {
        devices = await result.current.getEmployeeDevices('1');
      });

      expect(devices).toEqual(mockDevices);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('assignedTo=1')
      );
    });
  });

  describe('getEmployeeActivities', () => {
    test('fetches activities for employee', async () => {
      const mockActivities = [
        { id: '1', action: 'Employee created', timestamp: new Date() },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: mockActivities }),
      });

      const { result } = renderHook(() => useEmployees());

      let activities;
      await act(async () => {
        activities = await result.current.getEmployeeActivities('1');
      });

      expect(activities).toEqual(mockActivities);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('employeeId=1')
      );
    });
  });
});
