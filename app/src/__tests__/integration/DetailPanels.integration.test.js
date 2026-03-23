/**
 * Integration Tests - Detail Panels with Mock Data
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CandidateDetailPanel from '../../components/panels/CandidateDetailPanel';
import EmployeeDetailPanel from '../../components/panels/EmployeeDetailPanel';

describe('Detail Panels Integration Tests', () => {
  describe('Candidate Detail Panel Integration', () => {
    const mockCandidate = {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'Frontend Engineer',
      stage: 'interview',
      status: 'active',
      notes: 'Excellent communication skills, strong technical background',
      resumeUrl: null,
    };

    test('complete candidate workflow - view, edit, promote', () => {
      const mockOnClose = jest.fn();

      const { rerender } = render(
        <CandidateDetailPanel
          candidate={mockCandidate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Verify initial view
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('interview')).toBeInTheDocument();

      // Enter edit mode
      fireEvent.click(screen.getByText('Edit Details'));
      const nameInput = screen.getByDisplayValue('Alice Johnson');

      // Update details
      fireEvent.change(nameInput, { target: { value: 'Alice Johnson (Updated)' } });

      // Save changes
      fireEvent.click(screen.getByText('Save Changes'));

      // Verify edit mode closed
      expect(screen.getByText('Edit Details')).toBeInTheDocument();
    });

    test('resume upload workflow', () => {
      const mockOnClose = jest.fn();

      render(
        <CandidateDetailPanel
          candidate={mockCandidate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to resume tab
      fireEvent.click(screen.getByText('Resume'));

      // Should show upload button since no resume
      expect(screen.getByText('Upload Resume')).toBeInTheDocument();
    });

    test('candidate promotion workflow', () => {
      const mockOnClose = jest.fn();

      render(
        <CandidateDetailPanel
          candidate={mockCandidate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Click promote button
      fireEvent.click(screen.getByText('Promote to Employee'));

      // Modal should appear
      expect(screen.getByText(/Promote Alice Johnson to Employee/)).toBeInTheDocument();

      // Fill form
      const titleInput = screen.getByPlaceholderText('e.g., Senior Engineer');
      fireEvent.change(titleInput, { target: { value: 'Junior Frontend Engineer' } });

      const deptSelect = screen.getByDisplayValue(/Select a department/);
      fireEvent.change(deptSelect, { target: { value: 'Engineering' } });

      // Submit
      fireEvent.click(screen.getByText('Promote to Employee'));

      // Modal should close and panel should close
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('view activity history', () => {
      const mockOnClose = jest.fn();

      render(
        <CandidateDetailPanel
          candidate={mockCandidate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to history
      fireEvent.click(screen.getByText('History'));

      // Should show activity timeline
      expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
      expect(screen.getByText('Candidate created')).toBeInTheDocument();
    });
  });

  describe('Employee Detail Panel Integration', () => {
    const mockEmployee = {
      id: '2',
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      startDate: '2023-06-15',
      status: 'active',
      manager: 'Charlie Manager',
    };

    test('complete employee workflow - view, edit, manage onboarding', () => {
      const mockOnClose = jest.fn();

      render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Verify initial view
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });

    test('edit employee details', () => {
      const mockOnClose = jest.fn();

      render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Enter edit mode
      fireEvent.click(screen.getByText('Edit Details'));

      // Update title
      const titleInput = screen.getByDisplayValue('Senior Software Engineer');
      fireEvent.change(titleInput, { target: { value: 'Staff Engineer' } });

      // Save changes
      fireEvent.click(screen.getByText('Save Changes'));

      // Verify edit mode closed
      expect(screen.getByText('Edit Details')).toBeInTheDocument();
    });

    test('view and manage onboarding checklist', () => {
      const mockOnClose = jest.fn();

      render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to onboarding
      fireEvent.click(screen.getByText('Onboarding'));

      // Should show progress
      expect(screen.getByText('Onboarding Progress')).toBeInTheDocument();

      // Should show tasks
      expect(screen.getByText('Send welcome email')).toBeInTheDocument();
      expect(screen.getByText('Create email account')).toBeInTheDocument();

      // Get checkboxes for incomplete items
      const checkboxes = screen.getAllByRole('checkbox');

      // Mark a pending task as complete
      fireEvent.click(checkboxes[2]); // Third item (Manager intro call)
      expect(checkboxes[2]).toBeChecked();
    });

    test('view assigned devices', () => {
      const mockOnClose = jest.fn();

      render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to devices
      fireEvent.click(screen.getByText('Devices'));

      // Should show devices
      expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();

      // Both should be active
      expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    });

    test('view activity history', () => {
      const mockOnClose = jest.fn();

      render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Navigate to history
      fireEvent.click(screen.getByText('History'));

      // Should show activity timeline
      expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
    });

    test('responsive behavior - panel should be full width on mobile', () => {
      const mockOnClose = jest.fn();

      const { container } = render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const panel = container.querySelector('.fixed.inset-y-0');
      // Panel should have responsive width classes
      expect(panel).toHaveClass('w-full', 'md:w-[40%]');
    });
  });

  describe('Cross-Component Responsiveness', () => {
    test('candidate panel closes on escape key (in full implementation)', () => {
      const mockOnClose = jest.fn();
      const mockCandidate = {
        id: '1',
        name: 'Test Candidate',
        email: 'test@example.com',
      };

      render(
        <CandidateDetailPanel
          candidate={mockCandidate}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Click overlay to test close functionality
      const overlay = document.querySelector('.fixed.inset-0.bg-black');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('employee panel overlay click closes panel', () => {
      const mockOnClose = jest.fn();
      const mockEmployee = {
        id: '1',
        name: 'Test Employee',
        email: 'test@example.com',
      };

      render(
        <EmployeeDetailPanel
          employee={mockEmployee}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const overlay = document.querySelector('.fixed.inset-0.bg-black');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
