/**
 * Badge Component Tests
 */
import { render, screen } from '@testing-library/react';
import Badge from '../../../components/common/Badge';

describe('Badge Component', () => {
  test('renders with default props', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('applies correct variant class for active status', () => {
    const { container } = render(<Badge variant="active">Active</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-green-100', 'text-green-700');
  });

  test('applies correct variant class for rejected status', () => {
    const { container } = render(<Badge variant="rejected">Rejected</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-red-100', 'text-red-700');
  });

  test('applies correct variant class for pending status', () => {
    const { container } = render(<Badge variant="pending">Pending</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-700');
  });

  test('applies correct size class for small badge', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  test('applies correct size class for medium badge', () => {
    const { container } = render(<Badge size="md">Medium</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('px-3', 'py-1', 'text-sm');
  });

  test('applies correct size class for large badge', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
  });

  test('renders children correctly', () => {
    render(<Badge>Custom Badge Text</Badge>);
    expect(screen.getByText('Custom Badge Text')).toBeInTheDocument();
  });
});
