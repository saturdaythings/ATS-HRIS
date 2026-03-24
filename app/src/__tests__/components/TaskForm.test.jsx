/**
 * TaskForm Component Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../../components/TaskForm';

describe('TaskForm Component', () => {
  const mockOwnerRoles = ['onboarding-manager', 'manager', 'hr', 'team-lead'];

  const mockTask = {
    id: 't1',
    name: 'Setup dev environment',
    description: 'Install necessary tools and SDKs',
    ownerRole: 'onboarding-manager',
    dueDaysOffset: 0,
    order: 1,
  };

  const mockCallbacks = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all fields', () => {
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    expect(screen.getByLabelText('Task Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Owner Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Days Offset')).toBeInTheDocument();
  });

  test('populates form with existing task data in edit mode', () => {
    render(
      <TaskForm
        mode="edit"
        task={mockTask}
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    expect(screen.getByDisplayValue('Setup dev environment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Install necessary tools and SDKs')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  test('has empty form fields in create mode', () => {
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const nameInput = screen.getByLabelText('Task Name');
    expect(nameInput.value).toBe('');

    const descInput = screen.getByLabelText('Description');
    expect(descInput.value).toBe('');
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const nameInput = screen.getByLabelText('Task Name');
    const descInput = screen.getByLabelText('Description');
    const roleSelect = screen.getByLabelText('Owner Role');
    const daysInput = screen.getByLabelText('Due Days Offset');
    const submitButton = screen.getByText('Create Task');

    await user.type(nameInput, 'New Task');
    await user.type(descInput, 'Task description');
    await user.selectOptions(roleSelect, 'manager');
    await user.type(daysInput, '5');
    await user.click(submitButton);

    expect(mockCallbacks.onSubmit).toHaveBeenCalledWith({
      name: 'New Task',
      description: 'Task description',
      ownerRole: 'manager',
      dueDaysOffset: 5,
    });
  });

  test('validates required name field', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Task name is required')).toBeInTheDocument();
    expect(mockCallbacks.onSubmit).not.toHaveBeenCalled();
  });

  test('validates required owner role', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const nameInput = screen.getByLabelText('Task Name');
    await user.type(nameInput, 'New Task');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Owner role is required')).toBeInTheDocument();
  });

  test('handles numeric validation for due days offset', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const daysInput = screen.getByLabelText('Due Days Offset');
    await user.type(daysInput, 'abc');

    // Should only allow numbers
    expect(daysInput.value).not.toContain('abc');
  });

  test('allows negative due days offset (pre-onboarding)', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const nameInput = screen.getByLabelText('Task Name');
    const roleSelect = screen.getByLabelText('Owner Role');
    const daysInput = screen.getByLabelText('Due Days Offset');

    await user.type(nameInput, 'Pre-onboarding task');
    await user.selectOptions(roleSelect, 'hr');
    await user.clear(daysInput);
    await user.type(daysInput, '-14');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(mockCallbacks.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDaysOffset: -14,
      })
    );
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockCallbacks.onCancel).toHaveBeenCalled();
  });

  test('displays correct title for edit mode', () => {
    render(
      <TaskForm
        mode="edit"
        task={mockTask}
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByText('Update Task')).toBeInTheDocument();
  });

  test('displays correct title for create mode', () => {
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  test('populates owner role dropdown with all roles', () => {
    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={mockCallbacks.onSubmit}
        onCancel={mockCallbacks.onCancel}
      />
    );

    const roleSelect = screen.getByLabelText('Owner Role');
    const options = roleSelect.querySelectorAll('option');

    expect(options.length).toBe(mockOwnerRoles.length + 1); // +1 for default placeholder
    expect(screen.getByText('onboarding-manager')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
  });

  test('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TaskForm
        mode="create"
        ownerRoles={mockOwnerRoles}
        onSubmit={slowSubmit}
        onCancel={mockCallbacks.onCancel}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByText('Creating...');
    expect(submitButton).toBeDisabled();
  });
});
