/**
 * FeatureRequests Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeatureRequests from '../../../pages/admin/FeatureRequests';

// Mock the useAdmin hook
jest.mock('../../../hooks/useAdmin', () => ({
  useAdmin: jest.fn(),
}));

import { useAdmin } from '../../../hooks/useAdmin';

describe('FeatureRequests Page', () => {
  const mockRequests = [
    {
      id: '1',
      title: 'Add chat feature',
      description: 'Real-time messaging between team members',
      status: 'requested',
      type: 'api_endpoint',
      originalMessage: 'Can we add a chat feature?',
      claudeResponse: 'Yes, we can add a chat feature',
      estimatedHours: 40,
      createdAt: '2024-03-20T10:00:00Z',
      completedAt: null,
    },
    {
      id: '2',
      title: 'Improve UI responsiveness',
      description: 'Make the interface more responsive on mobile',
      status: 'reviewing',
      type: 'ui_page',
      originalMessage: 'Mobile UI is slow',
      claudeResponse: 'We can optimize the UI',
      estimatedHours: 20,
      createdAt: '2024-03-19T10:00:00Z',
      completedAt: null,
    },
    {
      id: '3',
      title: 'Add export to CSV',
      description: 'Export data to CSV format',
      status: 'deployed',
      type: 'api_endpoint',
      originalMessage: 'Need CSV export',
      claudeResponse: 'CSV export added',
      estimatedHours: 8,
      createdAt: '2024-03-18T10:00:00Z',
      completedAt: '2024-03-20T15:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAdmin.mockReturnValue({
      getFeatureRequests: jest.fn().mockResolvedValue({ requests: mockRequests }),
      updateFeatureRequest: jest.fn().mockResolvedValue({ request: {} }),
      loading: false,
      error: null,
    });
  });

  test('renders page title and description', async () => {
    render(<FeatureRequests />);

    expect(screen.getByText('Feature Requests')).toBeInTheDocument();
    expect(screen.getByText(/Track and manage feature requests/)).toBeInTheDocument();
  });

  test('loads and displays requests', async () => {
    render(<FeatureRequests />);

    await waitFor(() => {
      expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      expect(screen.getByText('Improve UI responsiveness')).toBeInTheDocument();
    });
  });

  describe('Kanban Board', () => {
    test('renders all status columns', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Requested')).toBeInTheDocument();
        expect(screen.getByText('Reviewing')).toBeInTheDocument();
        expect(screen.getByText('Implementing')).toBeInTheDocument();
        expect(screen.getByText('Testing')).toBeInTheDocument();
        expect(screen.getByText('Deployed')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();
      });
    });

    test('displays request count for each status', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        // Should show count badges
        const badges = screen.getAllByText(/^\d+$/);
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    test('groups requests by status', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
        expect(screen.getByText('Improve UI responsiveness')).toBeInTheDocument();
        expect(screen.getByText('Add export to CSV')).toBeInTheDocument();
      });
    });
  });

  describe('Request Card', () => {
    test('displays request title and description on cards', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
        expect(screen.getByText('Real-time messaging between team members')).toBeInTheDocument();
      });
    });

    test('displays estimated hours on card', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Est: 40h')).toBeInTheDocument();
      });
    });

    test('opens detail modal when card clicked', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText(/Real-time messaging between team members/)).toBeInTheDocument();
      });
    });
  });

  describe('Detail Modal', () => {
    test('displays request details in modal', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText(/Real-time messaging between team members/)).toBeInTheDocument();
        expect(screen.getByText('api_endpoint')).toBeInTheDocument();
      });
    });

    test('displays original message and Claude response', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText('Can we add a chat feature?')).toBeInTheDocument();
        expect(screen.getByText('Yes, we can add a chat feature')).toBeInTheDocument();
      });
    });

    test('allows changing status in modal', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ request: {} });
      useAdmin.mockReturnValue({
        getFeatureRequests: jest.fn().mockResolvedValue({ requests: mockRequests }),
        updateFeatureRequest: mockUpdate,
        loading: false,
        error: null,
      });

      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByDisplayValue('requested')).toBeInTheDocument();
      });

      const statusSelect = screen.getByDisplayValue('requested');
      fireEvent.change(statusSelect, { target: { value: 'reviewing' } });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('1', { status: 'reviewing' });
      });
    });

    test('allows setting estimated hours', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ request: {} });
      useAdmin.mockReturnValue({
        getFeatureRequests: jest.fn().mockResolvedValue({ requests: mockRequests }),
        updateFeatureRequest: mockUpdate,
        loading: false,
        error: null,
      });

      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter hours')).toBeInTheDocument();
      });

      const hoursInput = screen.getByPlaceholderText('Enter hours');
      const setButton = screen.getAllByText('Set')[0];

      fireEvent.change(hoursInput, { target: { value: '50' } });
      fireEvent.click(setButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('1', { estimatedHours: 50 });
      });
    });

    test('closes modal when close button clicked', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText(/Real-time messaging between team members/)).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByText('Close');
      fireEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText(/Real-time messaging between team members/)).not.toBeInTheDocument();
      });
    });

    test('displays timeline information', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add chat feature')).toBeInTheDocument();
      });

      const card = screen.getByText('Add chat feature');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText(/Created:/)).toBeInTheDocument();
      });
    });

    test('displays completed date for deployed requests', async () => {
      render(<FeatureRequests />);

      await waitFor(() => {
        expect(screen.getByText('Add export to CSV')).toBeInTheDocument();
      });

      const card = screen.getByText('Add export to CSV');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
      });
    });
  });

  test('shows error message on load failure', async () => {
    useAdmin.mockReturnValue({
      getFeatureRequests: jest.fn().mockRejectedValue(new Error('Load failed')),
      updateFeatureRequest: jest.fn(),
      loading: false,
      error: 'Load failed',
    });

    render(<FeatureRequests />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading requests/)).toBeInTheDocument();
    });
  });

  test('renders Refresh button', async () => {
    render(<FeatureRequests />);

    expect(screen.getByText('Refresh Now')).toBeInTheDocument();
  });
});
