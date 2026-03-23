/**
 * Health Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Health from '../../../pages/admin/Health';

// Mock the useAdmin hook
jest.mock('../../../hooks/useAdmin', () => ({
  useAdmin: jest.fn(),
}));

import { useAdmin } from '../../../hooks/useAdmin';

describe('Health Page', () => {
  const mockHealth = {
    apiStatus: 'healthy',
    apiResponseTime: 45,
    databaseStatus: 'healthy',
    queryTime: 15,
    uptime: '99.9',
    totalCandidates: 150,
    totalEmployees: 45,
    totalDevices: 120,
    totalCustomFields: 8,
    version: '2.0.0',
    build: 'latest',
    environment: 'production',
    recentActivities: [
      {
        icon: '👤',
        description: 'Alice Johnson hired',
        timestamp: '2024-03-20T10:00:00Z',
      },
      {
        icon: '💻',
        description: 'MacBook Pro assigned to Alice',
        timestamp: '2024-03-20T09:30:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useAdmin.mockReturnValue({
      getSystemHealth: jest.fn().mockResolvedValue({ health: mockHealth }),
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders page title and description', async () => {
    render(<Health />);

    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText(/Monitor system status/)).toBeInTheDocument();
  });

  test('loads and displays health data', async () => {
    render(<Health />);

    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('45ms')).toBeInTheDocument();
    });
  });

  describe('System Status', () => {
    test('displays API Server status', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('API Server')).toBeInTheDocument();
        expect(screen.getByText('Healthy')).toBeInTheDocument();
      });
    });

    test('displays Database status', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Database')).toBeInTheDocument();
      });
    });

    test('displays response times', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText(/45ms/)).toBeInTheDocument();
        expect(screen.getByText(/15ms/)).toBeInTheDocument();
      });
    });

    test('shows unhealthy status with different styling', async () => {
      useAdmin.mockReturnValue({
        getSystemHealth: jest.fn().mockResolvedValue({
          health: { ...mockHealth, apiStatus: 'unhealthy' },
        }),
        loading: false,
        error: null,
      });

      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Unhealthy')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics', () => {
    test('displays candidate count', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Total Candidates')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
      });
    });

    test('displays employee count', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Total Employees')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    test('displays device count', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Total Devices')).toBeInTheDocument();
        expect(screen.getByText('120')).toBeInTheDocument();
      });
    });

    test('displays custom field count', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Custom Fields')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    test('displays API response time metric', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('API Response Time')).toBeInTheDocument();
        expect(screen.getByText('45ms')).toBeInTheDocument();
      });
    });

    test('displays database query time metric', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Database Query Time')).toBeInTheDocument();
        expect(screen.getByText('15ms')).toBeInTheDocument();
      });
    });

    test('displays uptime metric', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Uptime')).toBeInTheDocument();
        expect(screen.getByText('99.9%')).toBeInTheDocument();
      });
    });

    test('renders progress bars for metrics', async () => {
      render(<Health />);

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar', { hidden: true });
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Recent Activities', () => {
    test('displays recent activities section', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activities')).toBeInTheDocument();
      });
    });

    test('displays activity descriptions', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson hired')).toBeInTheDocument();
        expect(screen.getByText('MacBook Pro assigned to Alice')).toBeInTheDocument();
      });
    });

    test('displays activity timestamps', async () => {
      render(<Health />);

      await waitFor(() => {
        const timestamps = screen.getAllByText(/\d+\/\d+\/\d+/);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });

    test('shows empty state when no activities', async () => {
      useAdmin.mockReturnValue({
        getSystemHealth: jest.fn().mockResolvedValue({
          health: { ...mockHealth, recentActivities: [] },
        }),
        loading: false,
        error: null,
      });

      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('No recent activities')).toBeInTheDocument();
      });
    });
  });

  describe('System Information', () => {
    test('displays system version', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Version:')).toBeInTheDocument();
        expect(screen.getByText('2.0.0')).toBeInTheDocument();
      });
    });

    test('displays build information', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Build:')).toBeInTheDocument();
        expect(screen.getByText('latest')).toBeInTheDocument();
      });
    });

    test('displays environment', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('Environment:')).toBeInTheDocument();
        expect(screen.getByText('production')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    test('renders Refresh Now button', async () => {
      render(<Health />);

      expect(screen.getByText('Refresh Now')).toBeInTheDocument();
    });

    test('calls getSystemHealth when Refresh button clicked', async () => {
      const mockGetHealth = jest.fn().mockResolvedValue({ health: mockHealth });
      useAdmin.mockReturnValue({
        getSystemHealth: mockGetHealth,
        loading: false,
        error: null,
      });

      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText('API Server')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh Now');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(2); // Once on mount, once on click
      });
    });

    test('disables Refresh button while loading', async () => {
      useAdmin.mockReturnValue({
        getSystemHealth: jest.fn().mockResolvedValue({ health: mockHealth }),
        loading: true,
        error: null,
      });

      render(<Health />);

      const refreshButton = screen.getByText('Refreshing...');
      expect(refreshButton).toBeDisabled();
    });

    test('displays last refresh time', async () => {
      render(<Health />);

      await waitFor(() => {
        expect(screen.getByText(/Last refreshed:/)).toBeInTheDocument();
      });
    });
  });

  test('shows error message on load failure', async () => {
    useAdmin.mockReturnValue({
      getSystemHealth: jest.fn().mockRejectedValue(new Error('Load failed')),
      loading: false,
      error: 'Load failed',
    });

    render(<Health />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading health/)).toBeInTheDocument();
    });
  });

  test('shows loading state initially', async () => {
    render(<Health />);

    // Before data loads, should show loading message
    expect(screen.getByText(/Loading health information/)).toBeInTheDocument();
  });
});
