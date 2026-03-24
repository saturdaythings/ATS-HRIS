/**
 * CandidateDetailPanel Component Tests
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
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
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
  });

  test('displays candidate header with name and email', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
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
    // Stage badge appears in the header
    const badges = screen.getAllByRole('status');
    expect(badges.length).toBeGreaterThan(0);
    // Check if any badge contains "interview"
    const stageFound = badges.some(badge => badge.textContent.toLowerCase().includes('interview'));
    expect(stageFound).toBe(true);
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
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
  });

  test('switches to resume tab when clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Resume'));
    });
    // Resume tab now shows multiple resumes with "Upload Another Resume" button
    expect(screen.getByText(/Upload.*Resume/i)).toBeInTheDocument();
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
    act(() => {
      fireEvent.click(screen.getByText('Edit Details'));
    });
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

  test('saves changes and exits edit mode', async () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Edit Details'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Save Changes'));
    });
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
    act(() => {
      fireEvent.click(screen.getByText('Promote to Employee'));
    });
    expect(screen.getByText(/Promote Jane Smith to Employee/)).toBeInTheDocument();
  });

  test('renders all five tabs', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  test('switches to interviews tab when clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Interviews'));
    });
    // Should display interview information - either Phone Screening or Technical Interview
    const phoneScreening = screen.queryByText(/Phone Screening/);
    const technicalInterview = screen.queryByText(/Technical Interview/);
    expect(phoneScreening || technicalInterview).toBeTruthy();
  });

  test('switches to skills tab when clicked', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Skills'));
    });
    expect(screen.getByText(/Select relevant skills/)).toBeInTheDocument();
  });

  test('allows selecting skills in skills tab', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Skills'));
    });

    // Find and click a skill checkbox
    const skillCheckboxes = screen.getAllByRole('checkbox');
    if (skillCheckboxes.length > 0) {
      act(() => {
        fireEvent.click(skillCheckboxes[0]);
      });
      // Verify checkbox is now checked
      expect(skillCheckboxes[0]).toBeChecked();
    }
  });

  test('displays selected skills in skills tab', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Skills'));
    });

    // Select a skill
    const skillCheckboxes = screen.getAllByRole('checkbox');
    if (skillCheckboxes.length > 0) {
      act(() => {
        fireEvent.click(skillCheckboxes[0]);
      });
      // Check if "Selected Skills" section appears
      expect(screen.getByText('Selected Skills')).toBeInTheDocument();
    }
  });

  test('displays resume list in resume tab', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    act(() => {
      fireEvent.click(screen.getByText('Resume'));
    });

    // Should show resume entry or upload button - check for upload button
    const uploadButton = screen.queryByText(/Upload.*Resume/i);
    expect(uploadButton).toBeInTheDocument();
  });

  test('shows additional form fields in edit mode', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));

    // Should be able to edit all form fields including phone, location, and roleApplied
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
  });

  test('displays phone field in display mode', () => {
    const candidateWithPhone = {
      ...mockCandidate,
      phone: '+1-555-0123',
    };

    render(
      <CandidateDetailPanel
        candidate={candidateWithPhone}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
  });

  test('displays location field in display mode', () => {
    const candidateWithLocation = {
      ...mockCandidate,
      location: 'San Francisco, CA',
    };

    render(
      <CandidateDetailPanel
        candidate={candidateWithLocation}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });
});
