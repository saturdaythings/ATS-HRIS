/**
 * TrackList Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackList from '../../components/TrackList';

// Mock the modals
jest.mock('../../components/modals/TrackModal', () => {
  return function MockTrackModal({ isOpen, onClose, onSubmit, mode }) {
    if (!isOpen) return null;
    return (
      <div data-testid="track-modal">
        <h2>{mode === 'create' ? 'Create Track' : 'Edit Track'}</h2>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSubmit({ name: 'Test Track', type: 'role' })}>
          Submit
        </button>
      </div>
    );
  };
});

describe('TrackList Component', () => {
  const mockTracks = [
    {
      id: '1',
      name: 'Engineering Onboarding',
      type: 'role',
      description: 'Standard onboarding for engineers',
      tasks: [],
      autoApply: true,
      clientId: null,
    },
    {
      id: '2',
      name: 'Acme Corp Onboarding',
      type: 'client',
      description: 'Custom onboarding for Acme',
      tasks: [],
      autoApply: false,
      clientId: 'acme-123',
    },
    {
      id: '3',
      name: 'Company Offboarding',
      type: 'company',
      description: 'Standard company offboarding',
      tasks: [],
      autoApply: false,
      clientId: null,
    },
  ];

  const mockCallbacks = {
    onCreateTrack: jest.fn(),
    onSelectTrack: jest.fn(),
    onUpdateTrack: jest.fn(),
    onDeleteTrack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders track list', () => {
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );
    expect(screen.getByText('Engineering Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp Onboarding')).toBeInTheDocument();
  });

  test('displays type badge for each track', () => {
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );
    expect(screen.getByText('role')).toBeInTheDocument();
    expect(screen.getByText('client')).toBeInTheDocument();
    expect(screen.getByText('company')).toBeInTheDocument();
  });

  test('calls onCreateTrack when create button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );

    const createButton = screen.getByText('Create Track');
    await user.click(createButton);

    expect(mockCallbacks.onCreateTrack).toHaveBeenCalled();
  });

  test('shows track modal when create is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );

    const createButton = screen.getByText('Create Track');
    await user.click(createButton);

    expect(screen.getByTestId('track-modal')).toBeInTheDocument();
    expect(screen.getByText('Create Track')).toBeInTheDocument();
  });

  test('calls onSelectTrack when track item is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );

    const trackItem = screen.getByText('Engineering Onboarding').closest('div');
    await user.click(trackItem);

    expect(mockCallbacks.onSelectTrack).toHaveBeenCalledWith(mockTracks[0]);
  });

  test('expands track to show tasks list', async () => {
    const user = userEvent.setup();
    const tracksWithTasks = [
      {
        ...mockTracks[0],
        tasks: [
          {
            id: 't1',
            name: 'Setup dev environment',
            description: 'Install necessary tools',
            ownerRole: 'onboarding-manager',
            dueDaysOffset: 0,
            order: 1,
          },
        ],
      },
    ];

    render(
      <TrackList tracks={tracksWithTasks} {...mockCallbacks} />
    );

    const expandButton = screen.getByTestId('expand-track-1');
    await user.click(expandButton);

    expect(screen.getByText('Setup dev environment')).toBeInTheDocument();
  });

  test('shows add task button when track is expanded', async () => {
    const user = userEvent.setup();
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );

    const expandButton = screen.getByTestId('expand-track-1');
    await user.click(expandButton);

    expect(screen.getByTestId('add-task-1')).toBeInTheDocument();
  });

  test('handles empty tracks list', () => {
    render(
      <TrackList tracks={[]} {...mockCallbacks} />
    );
    expect(screen.getByText('No tracks')).toBeInTheDocument();
  });

  test('displays task count in track header', () => {
    const tracksWithTasks = [
      {
        ...mockTracks[0],
        tasks: [
          { id: 't1', name: 'Task 1', ownerRole: 'eng', dueDaysOffset: 0, order: 1 },
          { id: 't2', name: 'Task 2', ownerRole: 'eng', dueDaysOffset: 1, order: 2 },
        ],
      },
    ];

    render(
      <TrackList tracks={tracksWithTasks} {...mockCallbacks} />
    );
    expect(screen.getByText(/2 tasks/)).toBeInTheDocument();
  });

  test('drag-to-reorder tasks (accessible pattern)', async () => {
    const user = userEvent.setup();
    const tracksWithTasks = [
      {
        ...mockTracks[0],
        tasks: [
          { id: 't1', name: 'Task 1', ownerRole: 'eng', dueDaysOffset: 0, order: 1 },
          { id: 't2', name: 'Task 2', ownerRole: 'eng', dueDaysOffset: 1, order: 2 },
        ],
      },
    ];

    render(
      <TrackList tracks={tracksWithTasks} {...mockCallbacks} />
    );

    // Expand track
    const expandButton = screen.getByTestId('expand-track-1');
    await user.click(expandButton);

    // Test that reorder controls exist
    const moveUpButton = screen.getByTestId('move-up-t1');
    expect(moveUpButton).toBeInTheDocument();
  });

  test('calls onDeleteTrack when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );

    const deleteButton = screen.getByTestId('delete-track-1');
    await user.click(deleteButton);

    // Confirm dialog should appear
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    expect(mockCallbacks.onDeleteTrack).toHaveBeenCalledWith('1');
  });

  test('calls onUpdateTrack when track is edited', async () => {
    const user = userEvent.setup();
    render(
      <TrackList tracks={mockTracks} {...mockCallbacks} />
    );

    const editButton = screen.getByTestId('edit-track-1');
    await user.click(editButton);

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    expect(mockCallbacks.onUpdateTrack).toHaveBeenCalled();
  });
});
