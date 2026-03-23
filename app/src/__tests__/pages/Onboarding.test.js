/**
 * Onboarding Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Onboarding from '../../pages/people/Onboarding';

// Mock the useOnboarding hook
jest.mock('../../hooks/useOnboarding', () => {
  return {
    useOnboarding: jest.fn(() => ({
      fetchTemplates: jest.fn(async () => [
        {
          id: 'template-1',
          name: 'Engineering Onboarding',
          role: 'Engineering',
          items: [],
        },
      ]),
      getChecklistForEmployee: jest.fn(),
      assignTemplate: jest.fn(),
      markItemComplete: jest.fn(),
      getProgress: jest.fn(),
      getChecklistDetail: jest.fn(async () => ({
        id: 'checklist-1',
        employeeId: 'emp-1',
        templateId: 'template-1',
        status: 'active',
        employee: {
          id: 'emp-1',
          name: 'John Doe',
          role: 'Engineer',
        },
        template: {
          id: 'template-1',
          name: 'Engineering Onboarding',
        },
        items: [
          {
            id: 'item-1',
            task: 'Set up computer',
            assignedTo: 'IT',
            dueDate: '2026-03-25T00:00:00Z',
            completed: false,
          },
          {
            id: 'item-2',
            task: 'Access training',
            assignedTo: 'HR',
            dueDate: '2026-03-26T00:00:00Z',
            completed: true,
          },
        ],
      })),
    })),
  };
});

// Mock fetch for employee data
global.fetch = jest.fn();

describe('Onboarding Page', () => {
  const mockEmployees = [
    {
      id: 'emp-1',
      name: 'John Doe',
      role: 'Engineer',
      startDate: '2026-03-15',
    },
    {
      id: 'emp-2',
      name: 'Jane Smith',
      role: 'Designer',
      startDate: '2026-03-10',
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation(async (url) => {
      if (url === '/api/employees') {
        return {
          ok: true,
          json: async () => ({ data: mockEmployees, error: null }),
        };
      }
      if (url.includes('/api/onboarding/checklists/')) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: 'checklist-1',
                employeeId: 'emp-1',
                templateId: 'template-1',
                status: 'active',
              },
            ],
            error: null,
          }),
        };
      }
      if (url.includes('/progress')) {
        return {
          ok: true,
          json: async () => ({
            data: { total: 2, completed: 1, percentage: 50 },
            error: null,
          }),
        };
      }
      return {
        ok: false,
        json: async () => ({ error: 'Not found' }),
      };
    });
  });

  test('renders page title and description', async () => {
    render(<Onboarding />);
    expect(screen.getByText('Onboarding Checklists')).toBeInTheDocument();
    expect(
      screen.getByText(/Track new hire onboarding tasks/)
    ).toBeInTheDocument();
  });

  test('renders three-column layout structure', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText('Employees')).toBeInTheDocument();
    });
    expect(screen.getByText('Checklist')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ data: mockEmployees, error: null }),
              }),
            100
          );
        })
    );

    render(<Onboarding />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('loads and displays employee list', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('displays employee role and filter options', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText('Engineer')).toBeInTheDocument();
      expect(screen.getByText('Designer')).toBeInTheDocument();
    });
  });

  test('filters employees by search term', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search employees/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('has filter status select with options', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const filterSelect = screen.getByDisplayValue('All');
    expect(filterSelect).toBeInTheDocument();
    expect(filterSelect.querySelector('[value="active"]')).toBeInTheDocument();
  });

  test('shows default message when no employee selected', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Select an employee to view their checklist/)
    ).toBeInTheDocument();
  });

  test('shows timeline section exists', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      const timeline = screen.getByText('Timeline');
      expect(timeline).toBeInTheDocument();
    });
  });

  test('renders search input with placeholder', async () => {
    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search employees')).toBeInTheDocument();
    });
  });

  test('displays error when employee load fails', async () => {
    fetch.mockImplementation(async () => ({
      ok: false,
      json: async () => ({ error: 'Failed to load' }),
    }));

    render(<Onboarding />);
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });
});
