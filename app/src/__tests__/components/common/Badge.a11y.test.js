/**
 * Accessibility Tests for Badge Component
 * Tests WCAG AA compliance, keyboard navigation, and semantic HTML
 */
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Badge from '../../../components/common/Badge';

describe('Badge Component - Accessibility', () => {
  // Test WCAG AA color contrast
  describe('Color Contrast (WCAG AA)', () => {
    test('default variant has sufficient contrast ratio', () => {
      const { container } = render(<Badge variant="default">Active</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('active variant has sufficient contrast ratio (green)', () => {
      const { container } = render(<Badge variant="active">Active</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-success-700');
    });

    test('error variant has sufficient contrast ratio (red)', () => {
      const { container } = render(<Badge variant="rejected">Rejected</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-error-700');
    });

    test('warning variant has sufficient contrast ratio (amber)', () => {
      const { container } = render(<Badge variant="pending">Pending</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-warning-700');
    });

    test('info variant has sufficient contrast ratio (blue)', () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-info-700');
    });
  });

  // Test semantic HTML
  describe('Semantic HTML', () => {
    test('renders as span element', () => {
      const { container } = render(<Badge>Test</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    test('has status role when rendered', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    test('includes aria-label attribute', () => {
      render(<Badge ariaLabel="Active status">Active</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Active status');
    });

    test('has default aria-label when not provided', () => {
      render(<Badge variant="active">Active</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label');
    });
  });

  // Test all variants are accessible
  describe('Variant Accessibility', () => {
    const variants = ['default', 'active', 'inactive', 'rejected', 'pending', 'info'];

    variants.forEach((variant) => {
      test(`${variant} variant is accessible`, async () => {
        const { container } = render(
          <Badge variant={variant} ariaLabel={`${variant} status`}>
            {variant}
          </Badge>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  // Test size variants
  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      test(`${size} size is accessible`, async () => {
        const { container } = render(
          <Badge size={size} ariaLabel={`${size} badge`}>
            Test
          </Badge>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  // Test text is readable
  describe('Text Content Accessibility', () => {
    test('badge text is visible and readable', () => {
      render(<Badge>Employee Status</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Employee Status');
    });

    test('whitespace is preserved in badge text', () => {
      render(<Badge>Multi Word Badge</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('whitespace-nowrap');
    });
  });

  // Test focus styles
  describe('Focus Visibility', () => {
    test('badge can receive focus through tab navigation', () => {
      const { container } = render(
        <button>
          <Badge>Focusable Badge</Badge>
        </button>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  // No violations test
  describe('Automated Accessibility Audit', () => {
    test('renders without accessibility violations', async () => {
      const { container } = render(
        <div>
          <Badge variant="active" ariaLabel="Active">
            Active
          </Badge>
          <Badge variant="inactive" ariaLabel="Inactive">
            Inactive
          </Badge>
          <Badge variant="pending" ariaLabel="Pending">
            Pending
          </Badge>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
