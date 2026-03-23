/**
 * Dashboard Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

// Mock the useActivities hook
jest.mock('../../hooks/useActivities', () => ({
  useActivities: jest.fn(),
}));

// Mock the ActivityFeed component
jest.mock('../../components/ActivityFeed', () => {
  return function MockActivityFeed({
    activities,
    loading,
    error,
    hasMore,
    onLoadMore,
  }) {
    return (
      <div data-testid="activity-feed">
        {loading && <div>Loading activities...</div>}
        {error && <div>Error: {error}</div>}
        {activities.length > 0 && (
          <div data-testid="activity-list">
            {activities.map((a) => (
              <div key={a.id} data-testid={`activity-${a.id}`}>
                {a.description}
              </div>
            ))}
          </div>
        )}
        {!loading && activities.length === 0 && !error && (
          <div>No activities</div>
        )}
        {hasMore && (
          <button
            onClick={onLoadMore}
            data-testid="load-more-button"
          >
            Load More
          </button>
        )}
      </div>
    );
  };
});

import { useActivities } from '../../hooks/useActivities';

describe('Dashboard Page', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'hire',
      description: 'Alice Johnson hired',
      employeeId: 'emp1',
      deviceId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'device_assign',
      description: 'Device assigned to Bob',
      employeeId: 'emp2',
      deviceId: 'dev1',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard header', () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to V.Two Ops/)).toBeInTheDocument();
  });

  test('renders metric cards', () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Candidates')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  test('renders activity feed widget', () => {
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
  });

  test('fetches activities on mount', () => {
    const mockFetchActivities = jest.fn();
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: mockFetchActivities,
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(mockFetchActivities).toHaveBeenCalledWith({ limit: 20 });
  });

  test('displays activities in feed', () => {
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('activity-1')).toBeInTheDocument();
    expect(screen.getByTestId('activity-2')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson hired')).toBeInTheDocument();
    expect(screen.getByText('Device assigned to Bob')).toBeInTheDocument();
  });

  test('displays loading state when fetching', () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: true,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  test('displays error state when fetch fails', () => {
    const errorMessage = 'Failed to fetch activities';
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: errorMessage,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('handles load more', () => {
    const mockLoadMore = jest.fn();
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: true,
      fetchActivities: jest.fn(),
      loadMore: mockLoadMore,
    });

    render(<Dashboard />);

    const loadMoreButton = screen.getByTestId('load-more-button');
    fireEvent.click(loadMoreButton);

    expect(mockLoadMore).toHaveBeenCalledWith({ limit: 20 });
  });

  test('renders status info panel', () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText(/Phase 2 Status/)).toBeInTheDocument();
    expect(screen.getByText(/Activity Feed widget added/)).toBeInTheDocument();
    expect(screen.getByText(/Timeline visualization/)).toBeInTheDocument();
    expect(screen.getByText(/Type filtering/)).toBeInTheDocument();
    expect(screen.getByText(/Search functionality/)).toBeInTheDocument();
  });

  test('responsive layout on different screen sizes', () => {
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    const { container } = render(<Dashboard />);

    // Check for responsive grid classes
    const content = container.innerHTML;
    expect(content).toContain('lg:col-span');
    expect(content).toContain('grid');
  });

  test('has no activities initially shows empty state', () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('No activities')).toBeInTheDocument();
  });
});
