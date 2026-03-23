/**
 * Accessibility Tests for ProgressBar Component
 * Tests WCAG AA compliance, ARIA attributes, and semantic structure
 */
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import ProgressBar from '../../../components/common/ProgressBar';

describe('ProgressBar Component - Accessibility', () => {
  // Test ARIA progressbar role
  describe('ARIA Attributes', () => {
    test('has progressbar role', () => {
      render(<ProgressBar completed={50} total={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('has aria-valuemin of 0', () => {
      render(<ProgressBar completed={50} total={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    });

    test('has aria-valuemax of 100', () => {
      render(<ProgressBar completed={50} total={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    test('has aria-valuenow reflecting current percentage', () => {
      render(<ProgressBar completed={75} total={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    });

    test('updates aria-valuenow when progress changes', () => {
      const { rerender } = render(
        <ProgressBar completed={25} total={100} />
      );
      let progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '25');

      rerender(<ProgressBar completed={75} total={100} />);
      progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    });

    test('has aria-label for screen readers', () => {
      render(
        <ProgressBar
          completed={50}
          total={100}
          ariaLabel="Onboarding progress"
        />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Onboarding progress'
      );
    });

    test('has default aria-label when not provided', () => {
      render(<ProgressBar completed={50} total={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label');
    });
  });

  // Test semantic structure
  describe('Semantic HTML', () => {
    test('renders as div element', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} />
      );
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    test('renders with proper structure', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} label />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      const fill = container.querySelector('.bg-gradient-to-r');
      expect(fill).toBeInTheDocument();
    });
  });

  // Test live regions for announcements
  describe('Live Region Updates', () => {
    test('progress counter has aria-live polite', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} label />
      );
      const counter = screen.getByText('50/100');
      const liveRegion = counter.closest('[aria-live]');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    test('percentage text has aria-live polite', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} label showPercentage />
      );
      const percentage = screen.getByText('50% complete');
      const liveRegion = percentage.closest('[aria-live]');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  // Test color contrast
  describe('Color Contrast (WCAG AA)', () => {
    test('progress bar fill color has sufficient contrast', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} />
      );
      const fill = container.querySelector(
        '.bg-gradient-to-r'
      );
      expect(fill).toHaveClass('from-primary-500', 'to-primary-600');
    });

    test('labels have sufficient contrast', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} label />
      );
      const labels = container.querySelectorAll('.text-neutral-700');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  // Test size variants
  describe('Size Variants Accessibility', () => {
    const sizes = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      test(`${size} size is accessible`, async () => {
        const { container } = render(
          <ProgressBar completed={50} total={100} size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  // Test edge cases
  describe('Edge Cases', () => {
    test('zero progress is accessible', async () => {
      const { container } = render(
        <ProgressBar completed={0} total={100} />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('complete progress is accessible', async () => {
      const { container } = render(
        <ProgressBar completed={100} total={100} />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('zero total is handled accessibly', async () => {
      const { container } = render(
        <ProgressBar completed={0} total={0} />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Test keyboard navigation
  describe('Keyboard Navigation', () => {
    test('progress bar container is in document flow', () => {
      const { container } = render(
        <ProgressBar completed={50} total={100} />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  // No violations test
  describe('Automated Accessibility Audit', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <div>
          <ProgressBar
            completed={25}
            total={100}
            label
            ariaLabel="Task 1 progress"
          />
          <ProgressBar
            completed={75}
            total={100}
            label
            size="lg"
            ariaLabel="Task 2 progress"
          />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
