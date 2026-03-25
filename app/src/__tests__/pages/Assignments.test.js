/**
 * Assignments Page Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Assignments from '../../pages/devices/Assignments';

// Mock useAssignments hook
const mockFetchAssignments = jest.fn();
const mockReturnAssignment = jest.fn();

jest.mock('../../hooks/useAssignments', () => ({
  useAssignments: () => ({
    fetchAssignments: mockFetchAssignments,
    returnAssignment: mockReturnAssignment,
    loading: false,
    error: null,
  }),
}));

const mockAssignments = [
  {
    id: '1',
    employeeName: 'John Doe',
    deviceName: 'MacBook Pro',
    deviceSerial: 'SN-001',
    assignedAt: '2024-01-15T00:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    deviceName: 'Dell Monitor',
    deviceSerial: 'SN-002',
    assignedAt: '2024-02-01T00:00:00Z',
    status: 'returned',
  },
];

describe('Assignments Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchAssignments.mockResolvedValue(mockAssignments);
  });

  test('renders page heading', async () => {
    render(<Assignments />);
    expect(screen.getByText('Device Assignments')).toBeInTheDocument();
    expect(screen.getByText('Active device assignments to employees')).toBeInTheDocument();
  });

  test('loads and displays assignments on mount', async () => {
    render(<Assignments />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('SN-001')).toBeInTheDocument();
    expect(mockFetchAssignments).toHaveBeenCalledTimes(1);
  });

  test('shows empty state when no assignments', async () => {
    mockFetchAssignments.mockResolvedValue([]);
    render(<Assignments />);

    await waitFor(() => {
      expect(screen.getByText('No assignments yet')).toBeInTheDocument();
    });
  });

  test('shows Return button only for active assignments', async () => {
    render(<Assignments />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Only one Return button (for the active assignment)
    const returnButtons = screen.getAllByText('Return');
    expect(returnButtons).toHaveLength(1);
  });

  test('shows confirm dialog when Return is clicked', async () => {
    const user = userEvent.setup();
    render(<Assignments />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Return'));

    expect(screen.getByText('Return Device')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to return the device assigned to John Doe/)).toBeInTheDocument();
  });

  test('renders table headers', async () => {
    render(<Assignments />);

    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Serial')).toBeInTheDocument();
    expect(screen.getByText('Assigned Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
