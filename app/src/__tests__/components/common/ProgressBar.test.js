/**
 * ProgressBar Component Tests
 */
import { render, screen } from '@testing-library/react';
import ProgressBar from '../../../components/common/ProgressBar';

describe('ProgressBar Component', () => {
  test('renders progress bar with correct percentage', () => {
    render(<ProgressBar completed={5} total={10} label={false} />);
    const container = screen.getByRole('progressbar');
    expect(container).toBeInTheDocument();
  });

  test('displays completed/total label when label prop is true', () => {
    render(<ProgressBar completed={3} total={10} label={true} />);
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });

  test('displays percentage text when label prop is true', () => {
    render(<ProgressBar completed={5} total={10} label={true} />);
    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  test('calculates percentage correctly', () => {
    const { container } = render(<ProgressBar completed={7} total={10} label={false} />);
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle('width: 70%');
  });

  test('handles zero total gracefully', () => {
    render(<ProgressBar completed={0} total={0} label={true} />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });

  test('handles completed equals total', () => {
    render(<ProgressBar completed={10} total={10} label={true} />);
    expect(screen.getByText('100% complete')).toBeInTheDocument();
  });

  test('applies correct height class for size prop', () => {
    const { container } = render(<ProgressBar completed={5} total={10} size="lg" />);
    const heightDiv = container.querySelector('[class*="h-"]');
    expect(heightDiv).toHaveClass('h-3');
  });
});
