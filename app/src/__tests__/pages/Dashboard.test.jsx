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

// Mock widget components
jest.mock('../../components/widgets/MetricsCard', () => {
  return function MockMetricsCard({ label, value }) {
    return <div data-testid={`metric-${label}`}>{label}: {value}</div>;
  };
});

jest.mock('../../components/widgets/CandidateStageWidget', () => {
  return function MockCandidateStageWidget() {
    return <div data-testid="candidate-stage-widget">Candidate Stage Widget</div>;
  };
});

jest.mock('../../components/widgets/OnboardingProgressWidget', () => {
  return function MockOnboardingProgressWidget() {
    return <div data-testid="onboarding-widget">Onboarding Widget</div>;
  };
});

jest.mock('../../components/widgets/DeviceInventoryWidget', () => {
  return function MockDeviceInventoryWidget() {
    return <div data-testid="device-widget">Device Widget</div>;
  };
});

jest.mock('../../components/widgets/TeamActivityWidget', () => {
  return function MockTeamActivityWidget() {
    return <div data-testid="team-activity-widget">Team Activity Widget</div>;
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
      type: 'device',
      description: 'Device assigned to Bob',
      employeeId: 'emp2',
      deviceId: 'dev1',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for metrics
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              candidatesInPipeline: 5,
              openPositions: 3,
              onboardingInProgress: 2,
              activeEmployees: 10,
              deviceInventory: {
                total: 20,
                available: 5,
                assigned: 15,
                retired: 0,
              },
              recentActivityCount: 12,
            },
          }),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders dashboard header', async () => {
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
    expect(screen.getByText(/Real-time metrics and activity overview/)).toBeInTheDocument();
  });

  test('renders metric cards with values', async () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-Active Candidates')).toBeInTheDocument();
      expect(screen.getByTestId('metric-In Pipeline')).toBeInTheDocument();
      expect(screen.getByTestId('metric-Onboarding')).toBeInTheDocument();
      expect(screen.getByTestId('metric-Devices')).toBeInTheDocument();
    });
  });

  test('renders all dashboard widgets', async () => {
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('candidate-stage-widget')).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-widget')).toBeInTheDocument();
      expect(screen.getByTestId('device-widget')).toBeInTheDocument();
      expect(screen.getByTestId('team-activity-widget')).toBeInTheDocument();
    });
  });

  test('renders activity feed widget', async () => {
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    });
  });

  test('fetches metrics and activities on mount', async () => {
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
    expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/metrics');
  });

  test('displays activities in feed', async () => {
    useActivities.mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-1')).toBeInTheDocument();
      expect(screen.getByTestId('activity-2')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson hired')).toBeInTheDocument();
      expect(screen.getByText('Device assigned to Bob')).toBeInTheDocument();
    });
  });

  test('displays loading state when fetching activities', () => {
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

  test('displays error state when activity fetch fails', () => {
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

  test('handles load more button click', async () => {
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

    await waitFor(() => {
      const loadMoreButton = screen.getByTestId('load-more-button');
      fireEvent.click(loadMoreButton);
      expect(mockLoadMore).toHaveBeenCalledWith({ limit: 20 });
    });
  });

  test('responsive layout grid', () => {
    useActivities.mockReturnValue({
      activities: [],
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

  test('has no activities initially shows empty state', async () => {
    useActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      hasMore: false,
      fetchActivities: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No activities')).toBeInTheDocument();
    });
  });
});
