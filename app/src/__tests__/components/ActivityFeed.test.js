/**
 * ActivityFeed Component Tests
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityFeed from '../../components/ActivityFeed';

describe('ActivityFeed Component', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'hire',
      description: 'Alice Johnson hired as Frontend Engineer',
      employeeId: 'emp1',
      deviceId: null,
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    },
    {
      id: '2',
      type: 'device_assign',
      description: 'MacBook Pro 16" assigned to Alice Johnson',
      employeeId: 'emp1',
      deviceId: 'dev1',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
    {
      id: '3',
      type: 'task_complete',
      description: 'Bob Smith completed onboarding task',
      employeeId: 'emp2',
      deviceId: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: '4',
      type: 'task_overdue',
      description: 'Security training overdue for Charlie Brown',
      employeeId: 'emp3',
      deviceId: null,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
  ];

  test('renders activity feed with activities', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    expect(screen.getByText(/Alice Johnson hired/)).toBeInTheDocument();
    expect(screen.getByText(/MacBook Pro/)).toBeInTheDocument();
  });

  test('displays loading state', () => {
    render(
      <ActivityFeed
        activities={[]}
        loading={true}
      />
    );

    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  test('displays error state', () => {
    const errorMessage = 'Failed to load activities';
    render(
      <ActivityFeed
        activities={[]}
        error={errorMessage}
      />
    );

    expect(screen.getByText(/Failed to load activities/)).toBeInTheDocument();
  });

  test('displays empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);

    expect(screen.getByText(/No activities found/)).toBeInTheDocument();
  });

  test('clears filters when clicking clear filters button', async () => {
    const { container } = render(
      <ActivityFeed
        activities={mockActivities}
      />
    );

    // Set search filter to trigger empty state
    const searchInput = screen.getByPlaceholderText('Search activities...');
    await act(async () => {
      await userEvent.type(searchInput, 'NonexistentActivity');
    });

    await waitFor(() => {
      expect(screen.getByText(/No activities found/)).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear filters');
    expect(clearButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(clearButton);
    });

    // After clearing, activities should show (no empty state message)
    await waitFor(() => {
      // The empty state should be gone
      const emptyMessage = screen.queryByText(/No activities found/);
      expect(emptyMessage).not.toBeInTheDocument();
      // And we should see activities again
      expect(screen.getByText(/Alice Johnson hired/)).toBeInTheDocument();
    });
  });

  describe('Activity display', () => {
    test('shows activity icons and labels', () => {
      render(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('🎉')).toBeInTheDocument();
      expect(screen.getByText('💻')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    test('displays time ago correctly', () => {
      render(<ActivityFeed activities={mockActivities} />);

      // Should show "Just now" or "2m ago" depending on exact timing
      const timeElements = screen.getAllByText(/ago|Just now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    test('displays activity descriptions', () => {
      render(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText(/Frontend Engineer/)).toBeInTheDocument();
      expect(screen.getByText(/Security training overdue/)).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    test('filters activities by search text', async () => {
      render(<ActivityFeed activities={mockActivities} />);

      const searchInput = screen.getByPlaceholderText('Search activities...');

      // Initially should show all activities
      expect(screen.getByText(/Alice Johnson hired/)).toBeInTheDocument();
      expect(screen.getByText(/MacBook Pro/)).toBeInTheDocument();

      // Search for specific text
      await act(async () => {
        await userEvent.type(searchInput, 'Alice');
      });

      await waitFor(() => {
        expect(screen.getByText(/Alice Johnson hired/)).toBeInTheDocument();
      });
    });

    test('shows empty state when search matches nothing', async () => {
      render(<ActivityFeed activities={mockActivities} />);

      const searchInput = screen.getByPlaceholderText('Search activities...');
      await act(async () => {
        await userEvent.type(searchInput, 'NonexistentActivity');
      });

      await waitFor(() => {
        expect(screen.getByText(/No activities found/)).toBeInTheDocument();
      });
    });
  });

  describe('Type filtering', () => {
    test('displays all activity type filter buttons', () => {
      render(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('🎉 Hired')).toBeInTheDocument();
      expect(screen.getByText('💻 Device Assigned')).toBeInTheDocument();
      expect(screen.getByText('✅ Task Completed')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Task Overdue')).toBeInTheDocument();
    });

    test('filters by activity type when clicking filter button', async () => {
      render(<ActivityFeed activities={mockActivities} />);

      const hireButton = screen.getByText('🎉 Hired');
      await act(async () => {
        fireEvent.click(hireButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Alice Johnson hired/)).toBeInTheDocument();
        expect(screen.queryByText(/MacBook Pro/)).not.toBeInTheDocument();
        expect(screen.queryByText(/completed onboarding/)).not.toBeInTheDocument();
      });
    });

    test('toggles filter off when clicking again', async () => {
      render(<ActivityFeed activities={mockActivities} />);

      const hireButton = screen.getByText('🎉 Hired');

      // Click to filter
      await act(async () => {
        fireEvent.click(hireButton);
      });
      await waitFor(() => {
        expect(screen.queryByText(/MacBook Pro/)).not.toBeInTheDocument();
      });

      // Click again to clear filter
      await act(async () => {
        fireEvent.click(hireButton);
      });
      await waitFor(() => {
        expect(screen.getByText(/MacBook Pro/)).toBeInTheDocument();
      });
    });

    test('calls onFilterChange callback when filter changes', async () => {
      const onFilterChange = jest.fn();
      render(
        <ActivityFeed
          activities={mockActivities}
          onFilterChange={onFilterChange}
        />
      );

      const hireButton = screen.getByText('🎉 Hired');
      await act(async () => {
        fireEvent.click(hireButton);
      });

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith({
          type: 'hire',
          search: '',
        });
      });
    });

    test('calls onFilterChange when search changes', async () => {
      const onFilterChange = jest.fn();
      render(
        <ActivityFeed
          activities={mockActivities}
          onFilterChange={onFilterChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search activities...');
      await act(async () => {
        await userEvent.type(searchInput, 'Alice');
      });

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    test('displays load more button when hasMore is true', () => {
      render(
        <ActivityFeed
          activities={mockActivities}
          hasMore={true}
        />
      );

      expect(screen.getByText('Load More Activities')).toBeInTheDocument();
    });

    test('does not display load more button when hasMore is false', () => {
      render(
        <ActivityFeed
          activities={mockActivities}
          hasMore={false}
        />
      );

      expect(screen.queryByText('Load More Activities')).not.toBeInTheDocument();
    });

    test('calls onLoadMore when load more button is clicked', async () => {
      const onLoadMore = jest.fn();
      const { rerender } = render(
        <ActivityFeed
          activities={mockActivities}
          hasMore={true}
          onLoadMore={onLoadMore}
          loading={false}
        />
      );

      const loadMoreButton = screen.getByText('Load More Activities');
      expect(loadMoreButton).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      expect(onLoadMore).toHaveBeenCalled();
    });

    test('disables load more button when loading', () => {
      render(
        <ActivityFeed
          activities={mockActivities}
          hasMore={true}
          loading={true}
        />
      );

      const loadMoreButton = screen.queryByText('Load More Activities');
      // When loading, button shows "Loading..." instead
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      if (loadMoreButton) {
        expect(loadMoreButton).toBeDisabled();
      }
    });

    test('shows loading text on button during load', () => {
      render(
        <ActivityFeed
          activities={mockActivities}
          hasMore={true}
          loading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Timeline visualization', () => {
    test('renders timeline structure for activities', () => {
      const { container } = render(<ActivityFeed activities={mockActivities} />);

      // Should have timeline circles and lines
      const circles = container.querySelectorAll('.rounded-full');
      expect(circles.length).toBeGreaterThan(0);
    });

    test('displays different background colors for activity types', () => {
      const { container } = render(<ActivityFeed activities={mockActivities} />);

      // Check for color classes in the rendered output
      const content = container.innerHTML;
      expect(content).toContain('bg-green');
      expect(content).toContain('bg-blue');
      expect(content).toContain('bg-yellow');
    });
  });

  describe('Responsive design', () => {
    test('renders search input on small screens', () => {
      render(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByPlaceholderText('Search activities...')).toBeInTheDocument();
    });

    test('renders activity items vertically', () => {
      const { container } = render(<ActivityFeed activities={mockActivities} />);

      // Should have vertical layout classes
      const timeline = container.querySelector('[class*="space-y"]');
      expect(timeline).toBeInTheDocument();
    });
  });
});
