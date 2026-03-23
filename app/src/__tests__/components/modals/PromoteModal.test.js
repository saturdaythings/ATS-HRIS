/**
 * PromoteModal Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import PromoteModal from '../../../components/modals/PromoteModal';

describe('PromoteModal Component', () => {
  const mockCandidate = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders modal with candidate name', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Promote John Doe to Employee')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Title input
    expect(screen.getByDisplayValue(/Select a department/)).toBeInTheDocument();
  });

  test('renders department options', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  test('calls onCancel when Cancel button is clicked', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('validates required fields on submit', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.click(screen.getByText('Promote to Employee'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Department is required')).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('allows form submission with valid data', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Fill in form
    const titleInput = screen.getByPlaceholderText('e.g., Senior Engineer');
    fireEvent.change(titleInput, { target: { value: 'Senior Engineer' } });

    const departmentSelect = screen.getByDisplayValue(/Select a department/);
    fireEvent.change(departmentSelect, { target: { value: 'Engineering' } });

    // Submit form
    fireEvent.click(screen.getByText('Promote to Employee'));

    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Senior Engineer',
        department: 'Engineering',
        candidateId: 1,
        candidateName: 'John Doe',
      })
    );
  });

  test('clears error messages when user fixes field', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit without data
    fireEvent.click(screen.getByText('Promote to Employee'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();

    // Fill in title field
    const titleInput = screen.getByPlaceholderText('e.g., Senior Engineer');
    fireEvent.change(titleInput, { target: { value: 'Engineer' } });

    // Error should be cleared
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  test('has correct initial start date', () => {
    render(
      <PromoteModal
        candidate={mockCandidate}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    expect(dateInput).toBeInTheDocument();
  });
});
