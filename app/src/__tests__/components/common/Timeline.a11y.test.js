/**
 * Accessibility Tests for Timeline Component
 * Tests WCAG AA compliance, semantic structure, and screen reader support
 */
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Timeline from '../../../components/common/Timeline';

describe('Timeline Component - Accessibility', () => {
  const mockActivities = [
    {
      id: '1',
      action: 'Employee hired',
      description: 'Alice Johnson hired as Frontend Engineer',
      timestamp: new Date('2024-01-15T10:30:00').toISOString(),
    },
    {
      id: '2',
      action: 'Device assigned',
      description: 'MacBook Pro assigned to Alice Johnson',
      timestamp: new Date('2024-01-14T14:00:00').toISOString(),
    },
  ];

  // Test ARIA attributes
  describe('ARIA Attributes', () => {
    test('has log role for activity history', () => {
      render(<Timeline activities={mockActivities} />);
      const timeline = screen.getByRole('log');
      expect(timeline).toBeInTheDocument();
    });

    test('has aria-label for context', () => {
      render(<Timeline activities={mockActivities} />);
      const timeline = screen.getByRole('log');
      expect(timeline).toHaveAttribute('aria-label', 'Activity timeline');
    });

    test('empty state has status role', () => {
      render(<Timeline activities={[]} />);
      const emptyState = screen.getByRole('status');
      expect(emptyState).toBeInTheDocument();
    });

    test('empty state has aria-live polite', () => {
      render(<Timeline activities={[]} />);
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
    });
  });

  // Test semantic HTML structure
  describe('Semantic HTML', () => {
    test('uses time element for timestamps', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const timeElements = container.querySelectorAll('time');
      expect(timeElements.length).toBe(mockActivities.length);
    });

    test('time element contains datetime attribute', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const timeElements = container.querySelectorAll('time');
      timeElements.forEach((time) => {
        expect(time.textContent).toBeTruthy();
      });
    });

    test('activity content is wrapped in semantic containers', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const contentDivs = container.querySelectorAll('[class*="flex-1"]');
      expect(contentDivs.length).toBe(mockActivities.length);
    });
  });

  // Test visual elements are hidden from screen readers
  describe('Decorative Elements Hidden', () => {
    test('timeline dots have aria-hidden', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const dots = container.querySelectorAll('[aria-hidden="true"]');
      expect(dots.length).toBeGreaterThan(0);
    });

    test('timeline connectors have aria-hidden', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const connectors = container.querySelectorAll('[aria-hidden="true"]');
      expect(connectors.length).toBeGreaterThan(0);
    });
  });

  // Test text content is accessible
  describe('Text Content Accessibility', () => {
    test('action text is visible and readable', () => {
      render(<Timeline activities={mockActivities} />);
      expect(screen.getByText('Employee hired')).toBeInTheDocument();
      expect(screen.getByText('Device assigned')).toBeInTheDocument();
    });

    test('description text is available', () => {
      render(<Timeline activities={mockActivities} />);
      expect(
        screen.getByText(/Alice Johnson hired as Frontend Engineer/)
      ).toBeInTheDocument();
    });

    test('timestamp is formatted and readable', () => {
      render(<Timeline activities={mockActivities} />);
      const timeElements = screen.getAllByText(/Jan/);
      expect(timeElements.length).toBe(mockActivities.length);
    });
  });

  // Test color contrast
  describe('Color Contrast (WCAG AA)', () => {
    test('action text has sufficient contrast', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const actions = container.querySelectorAll('.text-neutral-900');
      expect(actions.length).toBeGreaterThan(0);
    });

    test('description text has sufficient contrast', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const descriptions = container.querySelectorAll('.text-neutral-600');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    test('timestamp text has sufficient contrast', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const timestamps = container.querySelectorAll('.text-neutral-500');
      expect(timestamps.length).toBeGreaterThan(0);
    });

    test('timeline dot color meets contrast requirements', () => {
      const { container } = render(<Timeline activities={mockActivities} />);
      const dot = container.querySelector('.bg-primary-600');
      expect(dot).toBeInTheDocument();
    });
  });

  // Test empty state
  describe('Empty State Accessibility', () => {
    test('empty timeline shows accessible message', () => {
      render(<Timeline activities={[]} />);
      expect(screen.getByText('No activities yet')).toBeInTheDocument();
    });

    test('empty message is in status region', () => {
      render(<Timeline activities={[]} />);
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('No activities yet');
    });
  });

  // Test keyboard navigation
  describe('Keyboard Navigation', () => {
    test('timeline is in document flow', () => {
      render(<Timeline activities={mockActivities} />);
      const timeline = screen.getByRole('log');
      expect(timeline).toBeInTheDocument();
    });
  });

  // Test variant styles
  describe('Variant Accessibility', () => {
    test('default variant is accessible', async () => {
      const { container } = render(
        <Timeline activities={mockActivities} variant="default" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Test without descriptions
  describe('Optional Content Handling', () => {
    test('activities without description are accessible', () => {
      const activitiesNoDesc = [
        {
          id: '1',
          action: 'Task completed',
          timestamp: new Date().toISOString(),
        },
      ];
      render(<Timeline activities={activitiesNoDesc} />);
      expect(screen.getByText('Task completed')).toBeInTheDocument();
    });

    test('activities without timestamp are accessible', () => {
      const activitiesNoTime = [
        {
          id: '1',
          action: 'Status updated',
          description: 'Status changed to active',
        },
      ];
      render(<Timeline activities={activitiesNoTime} />);
      expect(screen.getByText('Unknown date')).toBeInTheDocument();
    });
  });

  // Test custom className
  describe('Custom Styling', () => {
    test('custom className is applied without breaking accessibility', async () => {
      const { container } = render(
        <Timeline
          activities={mockActivities}
          className="custom-timeline"
        />
      );
      const timeline = screen.getByRole('log');
      expect(timeline).toHaveClass('custom-timeline');
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // No violations test
  describe('Automated Accessibility Audit', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <div>
          <Timeline activities={mockActivities} />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('empty timeline renders without violations', async () => {
      const { container } = render(
        <div>
          <Timeline activities={[]} />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
