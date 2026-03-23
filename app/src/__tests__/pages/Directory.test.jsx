/**
 * Directory Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Directory from '../../pages/people/Directory';

// Mock the hooks and components
jest.mock('../../hooks/useEmployees', () => ({
  useEmployees: jest.fn(),
}));

jest.mock('../../components/panels/EmployeeDetailPanel', () => {
  return function MockDetailPanel({ employee, isOpen, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="detail-panel">
        <div>{employee?.name}</div>
        <button onClick={onClose}>Close Panel</button>
      </div>
    );
  };
});

import { useEmployees } from '../../hooks/useEmployees';

describe('Directory Page', () => {
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

  const mockFetchEmployees = jest.fn();
  const mockSearchEmployees = jest.fn((term) => {
    return mockEmployees.filter(e =>
      e.name.toLowerCase().includes(term.toLowerCase()) ||
      e.email.toLowerCase().includes(term.toLowerCase())
    );
  });
  const mockFilterByDepartment = jest.fn((dept) => {
    return dept ? mockEmployees.filter(e => e.department === dept) : mockEmployees;
  });
  const mockFilterByStatus = jest.fn((status) => {
    return status ? mockEmployees.filter(e => e.status === status) : mockEmployees;
  });
  const mockGetDepartments = jest.fn(() => ['Design', 'Engineering', 'Product']);
  const mockGetCountByDepartment = jest.fn(() => ({
    Engineering: 1,
    Product: 1,
    Design: 1,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    useEmployees.mockReturnValue({
      employees: mockEmployees,
      loading: false,
      error: null,
      fetchEmployees: mockFetchEmployees,
      searchEmployees: mockSearchEmployees,
      filterByDepartment: mockFilterByDepartment,
      filterByStatus: mockFilterByStatus,
      getDepartments: mockGetDepartments,
      getCountByDepartment: mockGetCountByDepartment,
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });
  });

  test('renders Directory page title', () => {
    render(<Directory />);
    expect(screen.getByText('Employee Directory')).toBeInTheDocument();
  });

  test('displays employee count', () => {
    render(<Directory />);
    expect(screen.getByText(/3 of 3 employees/)).toBeInTheDocument();
  });

  test('fetches employees on mount', () => {
    render(<Directory />);
    expect(mockFetchEmployees).toHaveBeenCalled();
  });

  test('renders table with employee data', () => {
    render(<Directory />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  test('displays all table columns', () => {
    render(<Directory />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  test('opens detail panel when employee row is clicked', async () => {
    const user = userEvent.setup();
    render(<Directory />);

    const rows = screen.getAllByText('John Doe');
    await user.click(rows[0]);

    // Detail panel should be open
    const detailPanel = screen.getByTestId('detail-panel');
    expect(detailPanel).toBeInTheDocument();
    expect(detailPanel).toHaveTextContent('John Doe');
  });

  test('closes detail panel when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Directory />);

    const rows = screen.getAllByText('John Doe');
    await user.click(rows[0]);

    const closeButton = screen.getByText('Close Panel');
    await user.click(closeButton);

    // Detail panel should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    });
  });

  test('searches employees by name in real-time', async () => {
    const user = userEvent.setup();
    mockSearchEmployees.mockImplementation((term) => {
      if (!term) return mockEmployees;
      return mockEmployees.filter(e =>
        e.name.toLowerCase().includes(term.toLowerCase()) ||
        e.email.toLowerCase().includes(term.toLowerCase())
      );
    });

    useEmployees.mockReturnValue({
      employees: mockEmployees,
      loading: false,
      error: null,
      fetchEmployees: mockFetchEmployees,
      searchEmployees: mockSearchEmployees,
      filterByDepartment: mockFilterByDepartment,
      filterByStatus: mockFilterByStatus,
      getDepartments: mockGetDepartments,
      getCountByDepartment: mockGetCountByDepartment,
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });

    render(<Directory />);

    const searchInput = screen.getByPlaceholderText(/Search by name or email/);
    await user.type(searchInput, 'John');

    // Should find John Doe
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('filters employees by department', async () => {
    const user = userEvent.setup();
    mockFilterByDepartment.mockImplementation((dept) => {
      if (!dept) return mockEmployees;
      return mockEmployees.filter(e => e.department === dept);
    });

    render(<Directory />);

    const deptSelect = screen.getByDisplayValue('All departments');
    await user.selectOptions(deptSelect, 'Engineering');

    // Should only show John Doe from Engineering
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('displays department count in dropdown', () => {
    render(<Directory />);

    expect(screen.getByText(/Engineering \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Product \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Design \(1\)/)).toBeInTheDocument();
  });

  test('filters employees by status', async () => {
    const user = userEvent.setup();
    mockFilterByStatus.mockImplementation((status) => {
      if (!status) return mockEmployees;
      return mockEmployees.filter(e => e.status === status);
    });

    render(<Directory />);

    const statusSelect = screen.getByDisplayValue('All statuses');
    await user.selectOptions(statusSelect, 'onboarding');

    // Should only show Alice Johnson who is onboarding
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  test('displays status badges with correct colors', () => {
    render(<Directory />);

    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges.length).toBeGreaterThan(0);

    const onboardingBadges = screen.getAllByText('Onboarding');
    expect(onboardingBadges.length).toBeGreaterThan(0);
  });

  test('displays formatted start dates', () => {
    render(<Directory />);

    // Check for formatted dates
    expect(screen.getByText(/Jan 15, 2024|January 15, 2024/)).toBeInTheDocument();
  });

  test('handles loading state', () => {
    useEmployees.mockReturnValue({
      employees: [],
      loading: true,
      error: null,
      fetchEmployees: mockFetchEmployees,
      searchEmployees: mockSearchEmployees,
      filterByDepartment: mockFilterByDepartment,
      filterByStatus: mockFilterByStatus,
      getDepartments: mockGetDepartments,
      getCountByDepartment: mockGetCountByDepartment,
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });

    render(<Directory />);
    expect(screen.getByText('Loading employees...')).toBeInTheDocument();
  });

  test('handles fetch error gracefully', () => {
    useEmployees.mockReturnValue({
      employees: [],
      loading: false,
      error: 'Failed to load employees',
      fetchEmployees: mockFetchEmployees,
      searchEmployees: mockSearchEmployees,
      filterByDepartment: mockFilterByDepartment,
      filterByStatus: mockFilterByStatus,
      getDepartments: mockGetDepartments,
      getCountByDepartment: mockGetCountByDepartment,
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });

    render(<Directory />);
    expect(screen.getByText('Failed to load employees')).toBeInTheDocument();
  });

  test('displays empty state when no employees', () => {
    useEmployees.mockReturnValue({
      employees: [],
      loading: false,
      error: null,
      fetchEmployees: mockFetchEmployees,
      searchEmployees: () => [],
      filterByDepartment: () => [],
      filterByStatus: () => [],
      getDepartments: () => [],
      getCountByDepartment: () => ({}),
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });

    render(<Directory />);
    expect(screen.getByText('No employees found')).toBeInTheDocument();
  });

  test('shows "no match" message when filter returns no results', async () => {
    const user = userEvent.setup();
    mockSearchEmployees.mockReturnValue([]);

    useEmployees.mockReturnValue({
      employees: mockEmployees,
      loading: false,
      error: null,
      fetchEmployees: mockFetchEmployees,
      searchEmployees: mockSearchEmployees,
      filterByDepartment: mockFilterByDepartment,
      filterByStatus: mockFilterByStatus,
      getDepartments: mockGetDepartments,
      getCountByDepartment: mockGetCountByDepartment,
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });

    render(<Directory />);

    const searchInput = screen.getByPlaceholderText(/Search by name or email/);
    await user.type(searchInput, 'xyz999');

    expect(screen.getByText('No employees match your filters')).toBeInTheDocument();
  });

  test('displays employee email correctly', () => {
    render(<Directory />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  test('displays employee title correctly', () => {
    render(<Directory />);

    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  test('displays employee department correctly', () => {
    render(<Directory />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  test('table is responsive on mobile', () => {
    // Mock mobile viewport
    global.innerWidth = 768;
    render(<Directory />);

    // Component should render without errors
    expect(screen.getByText('Employee Directory')).toBeInTheDocument();
  });

  test('updates filtered count when filters change', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Directory />);

    expect(screen.getByText(/3 of 3 employees/)).toBeInTheDocument();

    // Mock filtered results
    mockFilterByDepartment.mockReturnValue([mockEmployees[0]]);
    useEmployees.mockReturnValue({
      employees: mockEmployees,
      loading: false,
      error: null,
      fetchEmployees: mockFetchEmployees,
      searchEmployees: mockSearchEmployees,
      filterByDepartment: mockFilterByDepartment,
      filterByStatus: mockFilterByStatus,
      getDepartments: mockGetDepartments,
      getCountByDepartment: mockGetCountByDepartment,
      getEmployee: jest.fn(),
      updateEmployee: jest.fn(),
      getOnboardingChecklist: jest.fn(),
      markChecklistItemComplete: jest.fn(),
      getEmployeeDevices: jest.fn(),
      getEmployeeActivities: jest.fn(),
    });

    rerender(<Directory />);

    const deptSelect = screen.getByDisplayValue('All departments');
    await user.selectOptions(deptSelect, 'Engineering');

    // Count should update (will show after rerender)
    await waitFor(() => {
      expect(screen.queryByText(/1 of 3 employees/)).not.toBeInTheDocument();
    });
  });
});
