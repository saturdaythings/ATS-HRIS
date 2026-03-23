/**
 * EmployeeDetailPanel Component Tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeDetailPanel from '../../../components/panels/EmployeeDetailPanel';

describe('EmployeeDetailPanel Component', () => {
  const mockEmployee = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    title: 'Senior Engineer',
    department: 'Engineering',
    startDate: '2024-01-15',
    status: 'active',
    manager: 'Jane Manager',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={false}
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  test('renders panel when isOpen is true', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('displays employee header with name and email', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('displays status badge', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('displays all four tabs', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  test('closes panel when close button is clicked', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '' }).parentElement.querySelector('button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('switches to onboarding tab and shows progress', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Onboarding'));
    expect(screen.getByText('Onboarding Progress')).toBeInTheDocument();
    expect(screen.getByText(/% complete/)).toBeInTheDocument();
  });

  test('displays onboarding checklist items', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Onboarding'));
    expect(screen.getByText('Send welcome email')).toBeInTheDocument();
    expect(screen.getByText('Create email account')).toBeInTheDocument();
  });

  test('switches to devices tab and shows assigned devices', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Devices'));
    expect(screen.getByText('Assigned Devices')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
  });

  test('displays device serial number', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Devices'));
    expect(screen.getByText(/Serial: C123456789/)).toBeInTheDocument();
  });

  test('switches to history tab and shows timeline', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });

  test('shows overview tab content by default', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  test('allows editing employee details', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));

    const titleInput = screen.getByDisplayValue('Senior Engineer');
    fireEvent.change(titleInput, { target: { value: 'Principal Engineer' } });

    expect(titleInput).toHaveValue('Principal Engineer');
  });

  test('saves changes and exits edit mode', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Edit Details'));
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  test('can mark onboarding task as complete', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByText('Onboarding'));

    // Get first uncompleted task checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    // Third checkbox (first incomplete item)
    fireEvent.click(checkboxes[2]);

    expect(checkboxes[2]).toBeChecked();
  });

  test('displays action buttons in overview', () => {
    render(
      <EmployeeDetailPanel
        employee={mockEmployee}
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Edit Details')).toBeInTheDocument();
    expect(screen.getByText('Reassign Manager')).toBeInTheDocument();
    expect(screen.getByText('Offboard')).toBeInTheDocument();
  });
});
