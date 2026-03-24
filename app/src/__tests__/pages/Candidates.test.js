/**
 * Candidates Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Candidates from '../../pages/Candidates';

// Mock the useCandidates hook first
jest.mock('../../hooks/useCandidates', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock components with simple divs
jest.mock('../../components/modals/AddCandidateModal');
jest.mock('../../components/panels/CandidateDetailPanel');
jest.mock('../../components/common/SearchInput');
jest.mock('../../components/common/LoadingState');
jest.mock('../../components/common/ErrorBanner');
jest.mock('../../components/widgets/CandidateStageWidget');

// Import after mocking
import useCandidates from '../../hooks/useCandidates';
import AddCandidateModal from '../../components/modals/AddCandidateModal';
import CandidateDetailPanel from '../../components/panels/CandidateDetailPanel';
import SearchInput from '../../components/common/SearchInput';
import LoadingState from '../../components/common/LoadingState';
import ErrorBanner from '../../components/common/ErrorBanner';
import CandidateStageWidget from '../../components/widgets/CandidateStageWidget';

const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Software Engineer',
    roleApplied: 'Software Engineer',
    stage: 'screening',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'Product Manager',
    roleApplied: 'Product Manager',
    stage: 'interview',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Designer',
    roleApplied: 'Designer',
    stage: 'offer',
    status: 'active',
  },
];

const mockUseCandidates = {
  candidates: mockCandidates,
  loading: false,
  error: null,
  fetchCandidates: jest.fn(),
  createCandidate: jest.fn().mockResolvedValue({ data: mockCandidates[0] }),
  updateCandidate: jest.fn(),
  deleteCandidate: jest.fn(),
  getCandidatesByStage: jest.fn().mockReturnValue({}),
  getCountByStage: jest.fn().mockReturnValue({
    sourced: 0,
    screening: 1,
    interview: 1,
    offer: 1,
    hired: 0,
  }),
};

describe('Candidates Page', () => {
  beforeEach(() => {
    useCandidates.mockReturnValue(mockUseCandidates);

    // Setup mock component implementations
    AddCandidateModal.mockImplementation(({ isOpen, onClose, onSubmit }) => {
      if (!isOpen) return null;
      return <div data-testid="add-candidate-modal">
        <button data-testid="submit-candidate-button" onClick={() => onSubmit({ name: 'Test', email: 'test@example.com' })}>Add Candidate</button>
        <button data-testid="cancel-add-candidate" onClick={onClose}>Cancel</button>
      </div>;
    });

    CandidateDetailPanel.mockImplementation(({ candidate, isOpen, onClose }) => {
      if (!isOpen || !candidate) return null;
      return <div data-testid="candidate-detail-panel">
        <h2>{candidate.name}</h2>
        <p>{candidate.email}</p>
        <button data-testid="close-detail-panel" onClick={onClose}>Close</button>
      </div>;
    });

    SearchInput.mockImplementation(({ value, onChange, placeholder }) => {
      return <input data-testid="search-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
    });

    LoadingState.mockImplementation(({ message }) => {
      return <div data-testid="loading-state">{message}</div>;
    });

    ErrorBanner.mockImplementation(({ message }) => {
      return <div data-testid="error-banner">{message}</div>;
    });

    CandidateStageWidget.mockImplementation(() => {
      return <div data-testid="candidate-stage-widget">Stage Widget</div>;
    });

    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the candidates page with header', () => {
      render(<Candidates />);
      expect(screen.getByText('Candidates')).toBeInTheDocument();
      expect(screen.getByText('Manage your hiring pipeline and candidate profiles')).toBeInTheDocument();
    });

    it('should render add candidate button', () => {
      render(<Candidates />);
      const buttons = screen.getAllByText('Add Candidate');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render candidate stage widget', () => {
      render(<Candidates />);
      expect(screen.getByTestId('candidate-stage-widget')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<Candidates />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  describe('Candidate List Display', () => {
    it('should display candidates in table', () => {
      render(<Candidates />);
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should display candidate emails', () => {
      render(<Candidates />);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should display candidate stages', () => {
      render(<Candidates />);
      // Use getAllByText to handle multiple instances
      const screeningElements = screen.getAllByText('Screening');
      const interviewElements = screen.getAllByText('Interview');
      const offerElements = screen.getAllByText('Offer');
      expect(screeningElements.length).toBeGreaterThan(0);
      expect(interviewElements.length).toBeGreaterThan(0);
      expect(offerElements.length).toBeGreaterThan(0);
    });

    it('should show empty state when no candidates', () => {
      useCandidates.mockReturnValue({
        ...mockUseCandidates,
        candidates: [],
      });
      render(<Candidates />);
      expect(screen.getByText('No candidates found')).toBeInTheDocument();
    });
  });

  describe('Candidate Selection', () => {
    it('should open detail panel when candidate is clicked', async () => {
      render(<Candidates />);
      const nameCell = screen.getByText('John Smith');
      fireEvent.click(nameCell);
      expect(screen.getByTestId('candidate-detail-panel')).toBeInTheDocument();
    });

    it('should close detail panel when close button is clicked', async () => {
      render(<Candidates />);
      const nameCell = screen.getByText('John Smith');
      fireEvent.click(nameCell);
      expect(screen.getByTestId('candidate-detail-panel')).toBeInTheDocument();
      const closeButton = screen.getByTestId('close-detail-panel');
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('candidate-detail-panel')).not.toBeInTheDocument();
    });
  });

  describe('Add Candidate Modal', () => {
    it('should open modal when add candidate button is clicked', async () => {
      render(<Candidates />);
      const buttons = screen.getAllByText('Add Candidate');
      fireEvent.click(buttons[0]);
      expect(screen.getByTestId('add-candidate-modal')).toBeInTheDocument();
    });

    it('should close modal when cancel is clicked', async () => {
      render(<Candidates />);
      const buttons = screen.getAllByText('Add Candidate');
      fireEvent.click(buttons[0]);
      expect(screen.getByTestId('add-candidate-modal')).toBeInTheDocument();
      const cancelButton = screen.getByTestId('cancel-add-candidate');
      fireEvent.click(cancelButton);
      expect(screen.queryByTestId('add-candidate-modal')).not.toBeInTheDocument();
    });

    it('should submit candidate form', async () => {
      render(<Candidates />);
      const buttons = screen.getAllByText('Add Candidate');
      fireEvent.click(buttons[0]);

      const submitButton = screen.getByTestId('submit-candidate-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUseCandidates.createCandidate).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Candidate', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      render(<Candidates />);
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Candidate')).toBeInTheDocument();
    });

    it('should cancel delete confirmation', async () => {
      render(<Candidates />);
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Candidate')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(screen.queryByText('Delete Candidate')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error banner when fetch fails', () => {
      useCandidates.mockReturnValue({
        ...mockUseCandidates,
        error: 'Failed to fetch candidates',
      });
      render(<Candidates />);
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch candidates')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      useCandidates.mockReturnValue({
        ...mockUseCandidates,
        loading: true,
      });
      render(<Candidates />);
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });
});
