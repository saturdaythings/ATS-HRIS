/**
 * KanbanColumn Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import KanbanColumn from '../../components/KanbanColumn';

describe('KanbanColumn Component', () => {
  const mockCandidates = [
    {
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'Senior Engineer',
      stage: 'sourced',
      status: 'active',
      notes: '',
      resumeUrl: null,
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'Product Manager',
      stage: 'sourced',
      status: 'active',
      notes: '',
      resumeUrl: 'https://example.com/resume.pdf',
    },
  ];

  test('renders column header with stage name', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
      />
    );

    expect(screen.getByText('Sourced')).toBeInTheDocument();
  });

  test('displays correct candidate count', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders all candidates in column', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  test('displays candidate email and role', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
      />
    );

    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
  });

  test('shows resume indicator when resume is attached', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
      />
    );

    const resumeIndicators = screen.getAllByText('Resume attached');
    expect(resumeIndicators.length).toBe(1); // Only John Smith has a resume
  });

  test('displays status badge', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
      />
    );

    const badgeElements = screen.getAllByText('Active');
    expect(badgeElements.length).toBeGreaterThan(0);
  });

  test('shows empty state when no candidates', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={[]}
      />
    );

    expect(screen.getByText('No candidates')).toBeInTheDocument();
  });

  test('calls onSelectCandidate when clicking a candidate card', () => {
    const mockOnSelectCandidate = jest.fn();

    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
        onSelectCandidate={mockOnSelectCandidate}
      />
    );

    const candidateCard = screen.getByText('Jane Doe').closest('div[draggable]');
    fireEvent.click(candidateCard);

    expect(mockOnSelectCandidate).toHaveBeenCalledWith(mockCandidates[0]);
  });

  test('handles drag start event', () => {
    const mockOnDragStart = jest.fn();

    render(
      <KanbanColumn
        stage="sourced"
        candidates={mockCandidates}
        onDragStart={mockOnDragStart}
      />
    );

    const candidateCard = screen.getByText('Jane Doe').closest('div[draggable]');
    const dataTransfer = { effectAllowed: 'move' };

    fireEvent.dragStart(candidateCard, { dataTransfer });

    expect(mockOnDragStart).toHaveBeenCalled();
  });

  test('applies correct styling for different stages', () => {
    const stages = ['sourced', 'screening', 'interview', 'offer', 'hired'];

    stages.forEach((stage) => {
      const { container } = render(
        <KanbanColumn
          stage={stage}
          candidates={mockCandidates}
        />
      );

      const columnDiv = container.querySelector('[class*="rounded-lg"]');
      expect(columnDiv).toBeInTheDocument();
    });
  });

  test('displays candidate count as zero when empty', () => {
    render(
      <KanbanColumn
        stage="sourced"
        candidates={[]}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('supports different stage types', () => {
    const stages = ['sourced', 'screening', 'interview', 'offer', 'hired'];

    stages.forEach((stage) => {
      const { unmount } = render(
        <KanbanColumn
          stage={stage}
          candidates={mockCandidates}
        />
      );

      expect(screen.getByText(stage.charAt(0).toUpperCase() + stage.slice(1))).toBeInTheDocument();
      unmount();
    });
  });
});
