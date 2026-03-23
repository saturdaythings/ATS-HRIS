/**
 * CandidateDetailPanel Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateDetailPanel from '../../../components/panels/CandidateDetailPanel';

describe('CandidateDetailPanel Component', () => {
  const mockCandidate = {
    id: 1,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Software Engineer',
    stage: 'interview',
    status: 'active',
    notes: 'Strong candidate',
    resumeUrl: null,
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={false}
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders panel when isOpen is true', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('displays candidate header with name and email', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('displays status badge', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('displays stage badge', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('interview')).toBeInTheDocument();
  });

  test('closes panel when close button is clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '' }).parentElement.querySelector('button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes panel when overlay is clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders all three tabs', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  test('shows overview tab content by default', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('switches to resume tab when clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Resume'));
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
  });

  test('switches to history tab when clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });

  test('shows Edit button in overview mode', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Edit Details')).toBeInTheDocument();
  });

  test('switches to edit mode when Edit Details button is clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
  });

  test('displays action buttons in overview mode', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Promote to Employee')).toBeInTheDocument();
    expect(screen.getByText('Move Stage')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  test('allows editing candidate details', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));

    const nameInput = screen.getByDisplayValue('Jane Smith');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    expect(nameInput).toHaveValue('Jane Doe');
  });

  test('saves changes and exits edit mode', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  test('cancels edit mode without saving', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));
    fireEvent.click(screen.getAllByText('Cancel')[0]);
    expect(screen.getByText('Edit Details')).toBeInTheDocument();
  });

  test('shows promote modal when Promote to Employee is clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Promote to Employee'));
    expect(screen.getByText(/Promote Jane Smith to Employee/)).toBeInTheDocument();
  });
});
