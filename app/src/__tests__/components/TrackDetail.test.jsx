/**
 * TrackDetail Component Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackDetail from '../../components/TrackDetail';

// Mock modals
jest.mock('../../components/modals/TaskModal', () => {
  return function MockTaskModal({ isOpen, onClose, onSubmit, mode }) {
    if (!isOpen) return null;
    return (
      <div data-testid="task-modal">
        <h2>{mode === 'create' ? 'Create Task' : 'Edit Task'}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit({ name: 'New Task', description: '' })}>
          Submit
        </button>
      </div>
    );
  };
});

jest.mock('../../components/modals/ConfirmDialog', () => {
  return function MockConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-dialog">
        <p>{message}</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    );
  };
});

import TrackDetail from '../../components/TrackDetail';

describe('TrackDetail Component', () => {
  const mockTrack = {
    id: '1',
    name: 'Engineering Onboarding',
    type: 'role',
    description: 'Standard onboarding for engineers',
    tasks: [
      {
        id: 't1',
        name: 'Setup dev environment',
        description: 'Install necessary tools and SDKs',
        ownerRole: 'onboarding-manager',
        dueDaysOffset: 0,
        order: 1,
      },
      {
        id: 't2',
        name: 'Meet with team lead',
        description: 'Discuss role and expectations',
        ownerRole: 'manager',
        dueDaysOffset: 0,
        order: 2,
      },
    ],
    autoApply: true,
    clientId: null,
  };

  const mockCallbacks = {
    onClose: jest.fn(),
    onUpdate: jest.fn(),
    onAddTask: jest.fn(),
    onEditTask: jest.fn(),
    onDeleteTask: jest.fn(),
    onReorderTasks: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders track detail with name and description', () => {
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    expect(screen.getByText('Engineering Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Standard onboarding for engineers')).toBeInTheDocument();
  });

  test('displays all tasks in the track', () => {
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    expect(screen.getByText('Setup dev environment')).toBeInTheDocument();
    expect(screen.getByText('Meet with team lead')).toBeInTheDocument();
  });

  test('shows add task button', async () => {
    const user = userEvent.setup();
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const addButton = screen.getByText('Add Task');
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);
    expect(screen.getByTestId('task-modal')).toBeInTheDocument();
  });

  test('creates new task', async () => {
    const user = userEvent.setup();
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const addButton = screen.getByText('Add Task');
    await user.click(addButton);

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    expect(mockCallbacks.onAddTask).toHaveBeenCalled();
  });

  test('edits existing task', async () => {
    const user = userEvent.setup();
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const editButton = screen.getByTestId('edit-task-t1');
    await user.click(editButton);

    expect(screen.getByTestId('task-modal')).toBeInTheDocument();

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    expect(mockCallbacks.onEditTask).toHaveBeenCalled();
  });

  test('deletes task with confirmation', async () => {
    const user = userEvent.setup();
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const deleteButton = screen.getByTestId('delete-task-t1');
    await user.click(deleteButton);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    expect(mockCallbacks.onDeleteTask).toHaveBeenCalledWith('t1');
  });

  test('reorders tasks with move up button', async () => {
    const user = userEvent.setup();
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const moveDownButton = screen.getByTestId('move-down-t1');
    await user.click(moveDownButton);

    expect(mockCallbacks.onReorderTasks).toHaveBeenCalled();
  });

  test('disables move up button for first task', () => {
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const moveUpButton = screen.getByTestId('move-up-t1');
    expect(moveUpButton).toBeDisabled();
  });

  test('disables move down button for last task', () => {
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const lastTaskId = mockTrack.tasks[mockTrack.tasks.length - 1].id;
    const moveDownButton = screen.getByTestId(`move-down-${lastTaskId}`);
    expect(moveDownButton).toBeDisabled();
  });

  test('displays task details (owner role, due offset)', () => {
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    expect(screen.getByText('onboarding-manager')).toBeInTheDocument();
    expect(screen.getByText(/Day 0/)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    const closeButton = screen.getByTestId('close-detail');
    await user.click(closeButton);

    expect(mockCallbacks.onClose).toHaveBeenCalled();
  });

  test('shows track type badge', () => {
    render(
      <TrackDetail track={mockTrack} {...mockCallbacks} />
    );

    expect(screen.getByText('role')).toBeInTheDocument();
  });

  test('displays empty state when no tasks', () => {
    const trackWithoutTasks = {
      ...mockTrack,
      tasks: [],
    };

    render(
      <TrackDetail track={trackWithoutTasks} {...mockCallbacks} />
    );

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });
});
