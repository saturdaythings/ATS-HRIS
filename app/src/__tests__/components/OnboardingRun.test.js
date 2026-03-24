/**
 * OnboardingRun Component Tests
 * Tests task list, progress bar, status dropdowns, and bulk actions
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingRun from '../../components/OnboardingRun';

describe('OnboardingRun Component', () => {
  const mockRun = {
    id: 'run-1',
    employeeId: 'emp-1',
    type: 'onboarding',
    status: 'active',
    template: {
      name: 'Standard Onboarding',
    },
    tasks: [
      {
        id: 'task-1',
        name: 'IT Setup',
        owner: 'IT Team',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
        priority: 'high',
      },
      {
        id: 'task-2',
        name: 'Access Provisioning',
        owner: 'HR',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
        priority: 'high',
      },
      {
        id: 'task-3',
        name: 'Team Introduction',
        owner: 'Manager',
        dueDate: new Date(Date.now() + 604800000).toISOString(),
        status: 'completed',
        priority: 'medium',
      },
    ],
  };

  test('renders run with task list', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();

    render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    expect(screen.getByText('Standard Onboarding')).toBeInTheDocument();
    expect(screen.getByText('IT Setup')).toBeInTheDocument();
    expect(screen.getByText('Access Provisioning')).toBeInTheDocument();
    expect(screen.getByText('Team Introduction')).toBeInTheDocument();
  });

  test('displays progress bar with correct percentage', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();

    render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
  });

  test('color-codes tasks by due date status', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();

    const { container } = render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    const taskRows = container.querySelectorAll('[data-testid^="task-row-"]');
    expect(taskRows.length).toBe(3);

    // Overdue task should have red styling
    const overdueRow = container.querySelector('[data-testid="task-row-task-2"]');
    expect(overdueRow).toHaveClass('border-red-500');

    // Due soon should be yellow
    const dueSoonRow = container.querySelector('[data-testid="task-row-task-1"]');
    expect(dueSoonRow).toHaveClass('border-yellow-500');

    // On track should be green
    const onTrackRow = container.querySelector('[data-testid="task-row-task-3"]');
    expect(onTrackRow).toHaveClass('border-green-500');
  });

  test('updates task status via dropdown', async () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();

    const { container } = render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    const selects = container.querySelectorAll('select');
    const statusDropdown = selects[0];
    fireEvent.change(statusDropdown, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(mockOnUpdateTask).toHaveBeenCalledWith('task-1', 'completed');
    });
  });

  test('marks all tasks as complete via bulk action', async () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();

    render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    const bulkCompleteBtn = screen.getByText('Mark All Complete');
    fireEvent.click(bulkCompleteBtn);

    await waitFor(() => {
      expect(mockOnBulkAction).toHaveBeenCalledWith('mark-all-complete');
    });
  });

  test('prints checklist', async () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();
    const mockPrint = jest.fn();
    window.print = mockPrint;

    render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    const printBtn = screen.getByText('Print Checklist');
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(mockPrint).toHaveBeenCalled();
    });
  });

  test('closes run view when close button clicked', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTask = jest.fn();
    const mockOnBulkAction = jest.fn();

    render(
      <OnboardingRun
        run={mockRun}
        onClose={mockOnClose}
        onUpdateTask={mockOnUpdateTask}
        onBulkAction={mockOnBulkAction}
      />
    );

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
