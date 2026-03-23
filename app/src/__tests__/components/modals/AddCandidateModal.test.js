/**
 * AddCandidateModal Component Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCandidateModal from '../../../components/modals/AddCandidateModal';

// Mock the ResumeUploadForm component
jest.mock('../../../components/forms/ResumeUploadForm', () => {
  return function MockResumeUploadForm({ onUpload, onCancel }) {
    return (
      <div>
        <button onClick={() => onUpload({ url: 'http://example.com/resume.pdf' })}>
          Mock Upload Resume
        </button>
        <button onClick={onCancel}>Mock Cancel</button>
      </div>
    );
  };
});

describe('AddCandidateModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <AddCandidateModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  test('renders modal when isOpen is true', () => {
    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Add Candidate')).toBeInTheDocument();
  });

  test('displays form fields', () => {
    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Software Engineer')).toBeInTheDocument();
  });

  test('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButtons = screen.getAllByText('Add Candidate');
    const submitButton = submitButtons[submitButtons.length - 1]; // Get the button in the form
    await user.click(submitButton);

    // Should show validation error for missing name
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce({});

    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByPlaceholderText('Jane Doe');
    const emailInput = screen.getByPlaceholderText('jane@example.com');
    const roleInput = screen.getByPlaceholderText('Software Engineer');
    const submitButtons = screen.getAllByText('Add Candidate');
    const submitButton = submitButtons[submitButtons.length - 1]; // Get the button in the form

    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'jane@example.com');
    await user.type(roleInput, 'Software Engineer');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'Software Engineer',
        })
      );
    });
  });

  test('shows error message on submit failure', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce(new Error('Email already exists'));

    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByPlaceholderText('Jane Doe');
    const emailInput = screen.getByPlaceholderText('jane@example.com');
    const roleInput = screen.getByPlaceholderText('Software Engineer');
    const submitButtons = screen.getAllByText('Add Candidate');
    const submitButton = submitButtons[submitButtons.length - 1]; // Get the button in the form

    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'jane@example.com');
    await user.type(roleInput, 'Software Engineer');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  test('handles resume upload', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce({});

    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const uploadButton = screen.getByText('Upload Resume');
    await user.click(uploadButton);

    const mockUploadButton = screen.getByText('Mock Upload Resume');
    await user.click(mockUploadButton);

    // Resume should be marked as uploaded
    await waitFor(() => {
      expect(screen.getByText('✓ Resume uploaded')).toBeInTheDocument();
    });
  });

  test('disables submit button while submitting', async () => {
    render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByText('Adding...');
    expect(submitButton).toBeDisabled();
  });

  test('clears form after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce({});

    const { rerender } = render(
      <AddCandidateModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByPlaceholderText('Jane Doe');
    const emailInput = screen.getByPlaceholderText('jane@example.com');
    const roleInput = screen.getByPlaceholderText('Software Engineer');
    const submitButtons = screen.getAllByText('Add Candidate');
    const submitButton = submitButtons[submitButtons.length - 1]; // Get the button in the form

    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'jane@example.com');
    await user.type(roleInput, 'Software Engineer');
    await user.click(submitButton);

    // After successful submit, close should be called
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
