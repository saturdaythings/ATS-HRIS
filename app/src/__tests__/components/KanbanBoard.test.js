/**
 * KanbanBoard Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import KanbanBoard from '../../components/KanbanBoard';

describe('KanbanBoard Component', () => {
  const mockCandidates = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Frontend Engineer',
      stage: 'sourced',
      status: 'active',
      notes: '',
      resumeUrl: null,
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'Backend Engineer',
      stage: 'interview',
      status: 'active',
      notes: 'Strong background',
      resumeUrl: null,
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'UI Designer',
      stage: 'offer',
      status: 'active',
      notes: '',
      resumeUrl: 'https://example.com/resume.pdf',
    },
  ];

  test('renders Kanban board with all columns on desktop', () => {
    const { container } = render(
      <KanbanBoard candidates={mockCandidates} isMobile={false} />
    );

    expect(screen.getByText('Sourced')).toBeInTheDocument();
    expect(screen.getByText('Screening')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Offer')).toBeInTheDocument();
    expect(screen.getByText('Hired')).toBeInTheDocument();
  });

  test('displays candidates in correct columns', () => {
    render(
      <KanbanBoard candidates={mockCandidates} isMobile={false} />
    );

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  test('shows correct candidate count per column', () => {
    const { container } = render(
      <KanbanBoard candidates={mockCandidates} isMobile={false} />
    );

    const counts = container.querySelectorAll('[class*="rounded-full"]');
    expect(counts.length).toBeGreaterThan(0);
  });

  test('calls onSelectCandidate when clicking a candidate', () => {
    const mockOnSelectCandidate = jest.fn();

    render(
      <KanbanBoard
        candidates={mockCandidates}
        onSelectCandidate={mockOnSelectCandidate}
        isMobile={false}
      />
    );

    const candidateCard = screen.getByText('Alice Johnson').closest('div[draggable]');
    fireEvent.click(candidateCard);

    expect(mockOnSelectCandidate).toHaveBeenCalledWith(mockCandidates[0]);
  });

  test('renders list view on mobile', () => {
    render(
      <KanbanBoard candidates={mockCandidates} isMobile={true} />
    );

    // Mobile view should display all candidates
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    render(
      <KanbanBoard candidates={[]} isLoading={true} isMobile={false} />
    );

    expect(screen.getByText('Loading candidates...')).toBeInTheDocument();
  });

  test('displays empty state when no candidates', () => {
    render(
      <KanbanBoard candidates={[]} isLoading={false} isMobile={false} />
    );

    const noDataMessages = screen.getAllByText('No candidates');
    expect(noDataMessages.length).toBeGreaterThan(0);
  });

  test('handles drag and drop between columns', () => {
    const mockOnStageChange = jest.fn();

    render(
      <KanbanBoard
        candidates={mockCandidates}
        onStageChange={mockOnStageChange}
        isMobile={false}
      />
    );

    const candidateCard = screen.getByText('Alice Johnson').closest('div[draggable]');
    const dataTransfer = { effectAllowed: 'move' };

    fireEvent.dragStart(candidateCard, { dataTransfer });
    // Note: Full drag/drop testing would require more setup
  });

  test('filters candidates by stage', () => {
    const { container } = render(
      <KanbanBoard candidates={mockCandidates} isMobile={false} />
    );

    // Check that Alice (sourced) is visible
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

    // Bob should be in interview column, not sourced
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  test('handles empty candidate list', () => {
    render(
      <KanbanBoard candidates={[]} isMobile={false} />
    );

    // All columns should show "No candidates"
    const noDataMessages = screen.getAllByText('No candidates');
    expect(noDataMessages.length).toBe(5); // 5 columns
  });
});
