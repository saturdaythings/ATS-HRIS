/**
 * TimelineStep Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineStep from '../../components/TimelineStep';

describe('TimelineStep Component', () => {
  const defaultProps = {
    label: 'Day 1',
    completed: false,
    items: [
      {
        id: 'item-1',
        task: 'Set up computer',
        completed: false,
      },
      {
        id: 'item-2',
        task: 'Get access to tools',
        completed: true,
      },
    ],
  };

  test('renders phase label and item count', () => {
    render(<TimelineStep {...defaultProps} />);
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
  });

  test('shows completed indicator when all items are complete', () => {
    const props = {
      ...defaultProps,
      completed: true,
      items: [{ id: 'item-1', task: 'Task 1', completed: true }],
    };
    const { container } = render(<TimelineStep {...props} />);
    expect(container.querySelector('.text-green-600')).toBeInTheDocument();
  });

  test('shows incomplete indicator when items are not complete', () => {
    const { container } = render(<TimelineStep {...defaultProps} />);
    expect(container.querySelector('.text-slate-400')).toBeInTheDocument();
  });

  test('expands items list when clicked', () => {
    render(<TimelineStep {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Set up computer')).toBeInTheDocument();
    expect(screen.getByText('Get access to tools')).toBeInTheDocument();
  });

  test('collapses items list when clicked again', () => {
    render(<TimelineStep {...defaultProps} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.getByText('Set up computer')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText('Set up computer')).not.toBeInTheDocument();
  });

  test('shows completed status for completed items', () => {
    render(<TimelineStep {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));

    const completedItem = screen.getByText('Get access to tools');
    expect(completedItem).toHaveClass('line-through');
  });

  test('handles empty items array', () => {
    const props = { ...defaultProps, items: [] };
    render(<TimelineStep {...props} />);
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
  });

  test('calls onClick callback when provided', () => {
    const onClick = jest.fn();
    render(<TimelineStep {...defaultProps} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  test('renders with alternate colors when specified', () => {
    const props = { ...defaultProps, variant: 'success' };
    const { container } = render(<TimelineStep {...props} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('calculates progress percentage correctly', () => {
    render(<TimelineStep {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });
});
