/**
 * Hiring Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hiring from '../../pages/people/Hiring';

// Mock the hooks and components
jest.mock('../../hooks/useCandidates', () => ({
  useCandidates: jest.fn(),
}));

jest.mock('../../components/KanbanBoard', () => {
  return function MockKanbanBoard({ candidates, onSelectCandidate, isLoading }) {
    if (isLoading) {
      return <div>Loading candidates...</div>;
    }
    return (
      <div>
        {candidates.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCandidate(c)}
            data-testid={`candidate-${c.id}`}
          >
            {c.name}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../../components/panels/CandidateDetailPanel', () => {
  return function MockDetailPanel({ candidate, isOpen, onClose }) {
    if (!isOpen) return null;
    return (
      <div data-testid="detail-panel">
        <div>{candidate?.name}</div>
        <button onClick={onClose}>Close Panel</button>
      </div>
    );
  };
});

jest.mock('../../components/modals/AddCandidateModal', () => {
  return function MockAddModal({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;
    return (
      <div data-testid="add-modal">
        <button
          onClick={() => {
            onSubmit({
              name: 'Test Candidate',
              email: 'test@example.com',
              role: 'Engineer',
              stage: 'sourced',
              status: 'active',
              resumeUrl: '',
            });
          }}
        >
          Submit
        </button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

import { useCandidates } from '../../hooks/useCandidates';

describe('Hiring Page', () => {
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
      notes: '',
      resumeUrl: null,
    },
  ];

  const mockFetchCandidates = jest.fn();
  const mockCreateCandidate = jest.fn();
  const mockUpdateCandidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCandidates.mockReturnValue({
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchCandidates: mockFetchCandidates,
      createCandidate: mockCreateCandidate,
      updateCandidate: mockUpdateCandidate,
      deleteCandidate: jest.fn(),
      getCandidatesByStage: jest.fn(),
      getCountByStage: jest.fn(),
      filterCandidates: jest.fn(),
    });
  });

  test('renders Hiring page title', () => {
    render(<Hiring />);
    expect(screen.getByText('Hiring Pipeline')).toBeInTheDocument();
  });

  test('displays candidate count', () => {
    render(<Hiring />);
    expect(screen.getByText('2 candidates')).toBeInTheDocument();
  });

  test('renders Add Candidate button', () => {
    render(<Hiring />);
    const addButton = screen.getByText('Add Candidate');
    expect(addButton).toBeInTheDocument();
  });

  test('opens modal when Add Candidate is clicked', async () => {
    const user = userEvent.setup();
    render(<Hiring />);

    const addButton = screen.getByText('Add Candidate');
    await user.click(addButton);

    // Modal should be visible
    expect(screen.getByTestId('add-modal')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Hiring />);

    const addButton = screen.getByText('Add Candidate');
    await user.click(addButton);

    const closeButton = screen.getByText('Close Modal');
    await user.click(closeButton);

    // Modal should not be visible
    await waitFor(() => {
      expect(screen.queryByTestId('add-modal')).not.toBeInTheDocument();
    });
  });

  test('opens detail panel when candidate is selected', async () => {
    const user = userEvent.setup();
    render(<Hiring />);

    const candidateCard = screen.getByTestId('candidate-1');
    await user.click(candidateCard);

    // Detail panel should be open
    const detailPanel = screen.getByTestId('detail-panel');
    expect(detailPanel).toBeInTheDocument();
    // Check if Alice Johnson is in the detail panel
    expect(detailPanel).toHaveTextContent('Alice Johnson');
  });

  test('closes detail panel when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Hiring />);

    const candidateCard = screen.getByTestId('candidate-1');
    await user.click(candidateCard);

    const closeButton = screen.getByText('Close Panel');
    await user.click(closeButton);

    // Detail panel should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    });
  });

  test('searches candidates by name', async () => {
    const user = userEvent.setup();
    useCandidates.mockReturnValue({
      candidates: [mockCandidates[0]], // Only Alice after search
      loading: false,
      error: null,
      fetchCandidates: mockFetchCandidates,
      createCandidate: mockCreateCandidate,
      updateCandidate: mockUpdateCandidate,
      deleteCandidate: jest.fn(),
      getCandidatesByStage: jest.fn(),
      getCountByStage: jest.fn(),
      filterCandidates: jest.fn(),
    });

    render(<Hiring />);

    const searchInput = screen.getByPlaceholderText(/Search candidates/);
    await user.type(searchInput, 'Alice');

    // Should call fetchCandidates with search term
    expect(mockFetchCandidates).toHaveBeenCalledWith({ searchTerm: 'Alice' });
  });

  test('handles fetch error gracefully', () => {
    useCandidates.mockReturnValue({
      candidates: [],
      loading: false,
      error: 'Failed to load candidates',
      fetchCandidates: mockFetchCandidates,
      createCandidate: mockCreateCandidate,
      updateCandidate: mockUpdateCandidate,
      deleteCandidate: jest.fn(),
      getCandidatesByStage: jest.fn(),
      getCountByStage: jest.fn(),
      filterCandidates: jest.fn(),
    });

    render(<Hiring />);
    expect(screen.getByText('Failed to load candidates')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    useCandidates.mockReturnValue({
      candidates: [],
      loading: true,
      error: null,
      fetchCandidates: mockFetchCandidates,
      createCandidate: mockCreateCandidate,
      updateCandidate: mockUpdateCandidate,
      deleteCandidate: jest.fn(),
      getCandidatesByStage: jest.fn(),
      getCountByStage: jest.fn(),
      filterCandidates: jest.fn(),
    });

    render(<Hiring />);
    expect(screen.getByText('Loading candidates...')).toBeInTheDocument();
  });

  test('calls createCandidate when form is submitted', async () => {
    const user = userEvent.setup();
    mockCreateCandidate.mockResolvedValueOnce({});

    render(<Hiring />);

    const addButtons = screen.getAllByText('Add Candidate');
    await user.click(addButtons[0]); // Click the header button

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateCandidate).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('handles responsive layout on mobile', () => {
    // Mock mobile viewport
    global.innerWidth = 768;
    render(<Hiring />);

    // Component should render without errors
    expect(screen.getByText('Hiring Pipeline')).toBeInTheDocument();
  });

  test('fetches candidates on mount', () => {
    render(<Hiring />);

    expect(mockFetchCandidates).toHaveBeenCalled();
  });
});
