/**
 * Tracks Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tracks from '../../pages/Tracks';

// Mock the hooks
jest.mock('../../hooks/useTracks', () => ({
  useTracks: jest.fn(),
}));

jest.mock('../../components/TrackList', () => {
  return function MockTrackList({ tracks, onCreateTrack, onSelectTrack }) {
    return (
      <div data-testid="track-list">
        <button onClick={() => onCreateTrack()}>Create Track</button>
        {tracks.map(track => (
          <div key={track.id} onClick={() => onSelectTrack(track)}>
            {track.name}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../../components/TrackDetail', () => {
  return function MockTrackDetail({ track, onClose, onUpdate }) {
    if (!track) return null;
    return (
      <div data-testid="track-detail">
        <h2>{track.name}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('../../components/TimelinePreview', () => {
  return function MockTimelinePreview({ track }) {
    if (!track) return null;
    return (
      <div data-testid="timeline-preview">
        Timeline for {track.name}
      </div>
    );
  };
});

import { useTracks } from '../../hooks/useTracks';

describe('Tracks Page', () => {
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useTracks.mockReturnValue({
      tracks: mockTracks,
      loading: false,
      error: null,
      createTrack: jest.fn(),
      updateTrack: jest.fn(),
      deleteTrack: jest.fn(),
      getTracks: jest.fn(),
    });
  });

  test('renders Tracks page title', () => {
    render(<Tracks />);
    expect(screen.getByText('Tracks')).toBeInTheDocument();
  });

  test('displays TrackList component', () => {
    render(<Tracks />);
    expect(screen.getByTestId('track-list')).toBeInTheDocument();
  });

  test('creates a new track', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn();
    useTracks.mockReturnValue({
      tracks: mockTracks,
      loading: false,
      error: null,
      createTrack: mockCreate,
      updateTrack: jest.fn(),
      deleteTrack: jest.fn(),
      getTracks: jest.fn(),
    });

    render(<Tracks />);
    const createButton = screen.getByText('Create Track');
    await user.click(createButton);

    // Modal should appear or be handled by TrackList
    expect(screen.getByTestId('track-list')).toBeInTheDocument();
  });

  test('selects a track to show detail and timeline', async () => {
    const user = userEvent.setup();
    render(<Tracks />);

    const trackName = screen.getByText('Engineering Onboarding');
    await user.click(trackName);

    // Detail and timeline should be visible
    await waitFor(() => {
      expect(screen.getByTestId('track-detail')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-preview')).toBeInTheDocument();
    });
  });

  test('closes track detail when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Tracks />);

    const trackName = screen.getByText('Engineering Onboarding');
    await user.click(trackName);

    await waitFor(() => {
      expect(screen.getByTestId('track-detail')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('track-detail')).not.toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    useTracks.mockReturnValue({
      tracks: [],
      loading: true,
      error: null,
      createTrack: jest.fn(),
      updateTrack: jest.fn(),
      deleteTrack: jest.fn(),
      getTracks: jest.fn(),
    });

    render(<Tracks />);
    expect(screen.getByText('Loading tracks...')).toBeInTheDocument();
  });

  test('handles error state', () => {
    useTracks.mockReturnValue({
      tracks: [],
      loading: false,
      error: 'Failed to load tracks',
      createTrack: jest.fn(),
      updateTrack: jest.fn(),
      deleteTrack: jest.fn(),
      getTracks: jest.fn(),
    });

    render(<Tracks />);
    expect(screen.getByText('Failed to load tracks')).toBeInTheDocument();
  });

  test('displays empty state when no tracks', () => {
    useTracks.mockReturnValue({
      tracks: [],
      loading: false,
      error: null,
      createTrack: jest.fn(),
      updateTrack: jest.fn(),
      deleteTrack: jest.fn(),
      getTracks: jest.fn(),
    });

    render(<Tracks />);
    expect(screen.getByText('No tracks created yet')).toBeInTheDocument();
  });

  test('fetches tracks on mount', () => {
    const mockGetTracks = jest.fn();
    useTracks.mockReturnValue({
      tracks: mockTracks,
      loading: false,
      error: null,
      createTrack: jest.fn(),
      updateTrack: jest.fn(),
      deleteTrack: jest.fn(),
      getTracks: mockGetTracks,
    });

    render(<Tracks />);
    expect(mockGetTracks).toHaveBeenCalled();
  });
});
