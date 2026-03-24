/**
 * TaskStatusForm Component Tests
 * Tests inline task status updates with dropdown and owner field
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskStatusForm from '../../components/TaskStatusForm';

describe('TaskStatusForm Component', () => {
  const mockTask = {
    id: 'task-1',
    name: 'IT Setup',
    owner: 'IT Team',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'pending',
  };

  test('renders task status form with all fields', () => {
    const mockOnSubmit = jest.fn();

    const { container } = render(
      <TaskStatusForm task={mockTask} onSubmit={mockOnSubmit} />
    );

    const statusDropdown = container.querySelector('select');
    expect(statusDropdown).toBeInTheDocument();
    expect(statusDropdown.value).toBe('pending');
    expect(screen.getByText('IT Team')).toBeInTheDocument();
  });

  test('updates status when dropdown changed', async () => {
    const mockOnSubmit = jest.fn();

    const { container } = render(
      <TaskStatusForm task={mockTask} onSubmit={mockOnSubmit} />
    );

    const statusDropdown = container.querySelector('select');
    fireEvent.change(statusDropdown, { target: { value: 'in-progress' } });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...mockTask,
        status: 'in-progress',
        owner: 'IT Team',
      });
    });
  });

  test('displays correct status options', () => {
    const mockOnSubmit = jest.fn();

    const { container } = render(
      <TaskStatusForm task={mockTask} onSubmit={mockOnSubmit} />
    );

    const statusSelect = container.querySelector('select');
    const options = statusSelect.querySelectorAll('option');

    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(Array.from(options).map(o => o.value)).toContain('pending');
    expect(Array.from(options).map(o => o.value)).toContain('in-progress');
    expect(Array.from(options).map(o => o.value)).toContain('completed');
  });

  test('marks completed task with visual indicator', () => {
    const completedTask = { ...mockTask, status: 'completed' };
    const mockOnSubmit = jest.fn();

    const { container } = render(
      <TaskStatusForm task={completedTask} onSubmit={mockOnSubmit} />
    );

    const checkmark = container.querySelector('[data-testid="checkmark-icon"]');
    expect(checkmark).toBeInTheDocument();
  });

  test('renders owner field and allows editing', async () => {
    const mockOnSubmit = jest.fn();

    const { container } = render(
      <TaskStatusForm task={mockTask} onSubmit={mockOnSubmit} isEditable={true} />
    );

    const ownerInputs = container.querySelectorAll('input[type="text"]');
    expect(ownerInputs.length).toBeGreaterThan(0);
    const ownerInput = ownerInputs[0];
    expect(ownerInput.value).toBe('IT Team');
    expect(ownerInput).not.toBeDisabled();

    fireEvent.change(ownerInput, { target: { value: 'New Owner' } });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...mockTask,
        status: 'pending',
        owner: 'New Owner',
      });
    });
  });

  test('displays due date color coding', () => {
    const mockOnSubmit = jest.fn();
    const overdueTask = {
      ...mockTask,
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    };

    const { container } = render(
      <TaskStatusForm task={overdueTask} onSubmit={mockOnSubmit} />
    );

    const dueLabel = container.querySelector('[data-testid="due-date-label"]');
    expect(dueLabel).toHaveClass('text-red-600');
  });

  test('handles submit with all changes', async () => {
    const mockOnSubmit = jest.fn();

    const { container } = render(
      <TaskStatusForm task={mockTask} onSubmit={mockOnSubmit} isEditable={true} />
    );

    const ownerInput = container.querySelector('input[type="text"]');
    fireEvent.change(ownerInput, { target: { value: 'New Owner' } });

    const statusDropdown = container.querySelector('select');
    fireEvent.change(statusDropdown, { target: { value: 'in-progress' } });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'New Owner',
          status: 'in-progress',
        })
      );
    });
  });
});
