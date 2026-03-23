/**
 * Timeline Component Tests
 */
import { render, screen } from '@testing-library/react';
import Timeline from '../../../components/common/Timeline';

describe('Timeline Component', () => {
  const mockActivities = [
    {
      id: 1,
      action: 'Candidate created',
      timestamp: new Date('2024-01-01'),
    },
    {
      id: 2,
      action: 'Resume uploaded',
      description: 'candidate-resume.pdf',
      timestamp: new Date('2024-01-05'),
    },
  ];

  test('renders empty state when no activities provided', () => {
    render(<Timeline activities={[]} />);
    expect(screen.getByText('No activities yet')).toBeInTheDocument();
  });

  test('renders all activities', () => {
    render(<Timeline activities={mockActivities} />);
    expect(screen.getByText('Candidate created')).toBeInTheDocument();
    expect(screen.getByText('Resume uploaded')).toBeInTheDocument();
  });

  test('displays activity description when provided', () => {
    render(<Timeline activities={mockActivities} />);
    expect(screen.getByText('candidate-resume.pdf')).toBeInTheDocument();
  });

  test('formats timestamp correctly', () => {
    render(<Timeline activities={mockActivities} />);
    // Check that date is formatted as expected
    const dateText = screen.getByText(/Jan/);
    expect(dateText).toBeInTheDocument();
  });

  test('does not render timeline dots when activities array is empty', () => {
    const { container } = render(<Timeline activities={[]} />);
    const dots = container.querySelectorAll('[class*="rounded-full"]');
    expect(dots.length).toBe(0);
  });

  test('renders correct number of timeline dots', () => {
    const { container } = render(<Timeline activities={mockActivities} />);
    const dots = container.querySelectorAll('.bg-primary-600');
    expect(dots.length).toBe(mockActivities.length);
  });
});
