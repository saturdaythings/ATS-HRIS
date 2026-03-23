/**
 * Templates Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Templates from '../../../pages/admin/Templates';

// Mock the useAdmin hook
jest.mock('../../../hooks/useAdmin', () => ({
  useAdmin: jest.fn(),
}));

import { useAdmin } from '../../../hooks/useAdmin';

describe('Templates Page', () => {
  const mockTemplates = [
    {
      id: '1',
      name: 'Engineering Onboarding',
      role: 'Junior Engineer',
      items: [
        { id: '1', task: 'Set up laptop', assignedTo: 'IT', dueDate: '2024-04-01' },
        { id: '2', task: 'GitHub access', assignedTo: 'Manager', dueDate: '2024-04-02' },
      ],
    },
    {
      id: '2',
      name: 'Design Onboarding',
      role: 'UI Designer',
      items: [
        { id: '3', task: 'Design tools setup', assignedTo: 'IT', dueDate: '2024-04-01' },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAdmin.mockReturnValue({
      getOnboardingTemplates: jest.fn().mockResolvedValue({ templates: mockTemplates }),
      createTemplate: jest.fn().mockResolvedValue({ template: {} }),
      updateTemplate: jest.fn().mockResolvedValue({ template: {} }),
      deleteTemplate: jest.fn().mockResolvedValue({ success: true }),
      loading: false,
      error: null,
    });
  });

  test('renders page title and description', async () => {
    render(<Templates />);

    expect(screen.getByText('Onboarding Templates')).toBeInTheDocument();
    expect(screen.getByText(/Create and manage onboarding checklists/)).toBeInTheDocument();
  });

  test('loads and displays templates', async () => {
    render(<Templates />);

    await waitFor(() => {
      expect(screen.getByText('Engineering Onboarding')).toBeInTheDocument();
      expect(screen.getByText('Design Onboarding')).toBeInTheDocument();
    });
  });

  test('renders Create Template button', async () => {
    render(<Templates />);

    const createButton = screen.getByText('+ Create Template');
    expect(createButton).toBeInTheDocument();
    expect(createButton).not.toBeDisabled();
  });

  test('displays template item count', async () => {
    render(<Templates />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 items for first template
    });
  });

  test('opens modal when Create button clicked', async () => {
    render(<Templates />);

    const createButton = screen.getByText('+ Create Template');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });
  });

  test('displays Edit and Delete buttons for each template', async () => {
    render(<Templates />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      expect(editButtons.length).toBe(mockTemplates.length);
      expect(deleteButtons.length).toBe(mockTemplates.length);
    });
  });

  describe('Create Template', () => {
    test('allows entering template name and role', async () => {
      render(<Templates />);

      const createButton = screen.getByText('+ Create Template');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/e.g., Engineering Onboarding/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g., Junior Engineer/)).toBeInTheDocument();
      });
    });

    test('validates template name and role are required', async () => {
      render(<Templates />);

      const createButton = screen.getByText('+ Create Template');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create Template')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Create Template');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Template name and role are required/)).toBeInTheDocument();
      });
    });

    test('allows adding checklist items', async () => {
      render(<Templates />);

      const createButton = screen.getByText('+ Create Template');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('+ Add Item')).toBeInTheDocument();
      });

      const addItemButton = screen.getByText('+ Add Item');
      fireEvent.click(addItemButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument();
      });
    });

    test('can set item details', async () => {
      render(<Templates />);

      const createButton = screen.getByText('+ Create Template');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('+ Add Item')).toBeInTheDocument();
      });

      const addItemButton = screen.getByText('+ Add Item');
      fireEvent.click(addItemButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument();
      });

      const taskInput = screen.getByPlaceholderText('Task description');
      const assignedSelect = screen.getByDisplayValue('HR');

      fireEvent.change(taskInput, { target: { value: 'Set up laptop' } });
      fireEvent.change(assignedSelect, { target: { value: 'IT' } });

      expect(taskInput).toHaveValue('Set up laptop');
      expect(assignedSelect).toHaveValue('IT');
    });

    test('can remove items', async () => {
      render(<Templates />);

      const createButton = screen.getByText('+ Create Template');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('+ Add Item')).toBeInTheDocument();
      });

      const addItemButton = screen.getByText('+ Add Item');
      fireEvent.click(addItemButton);

      await waitFor(() => {
        expect(screen.getByText('Remove Item')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove Item');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Task description')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Template', () => {
    test('opens modal with template data when Edit clicked', async () => {
      render(<Templates />);

      await waitFor(() => {
        expect(screen.getByText('Engineering Onboarding')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Template')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Template', () => {
    test('calls deleteTemplate when Delete clicked and confirmed', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ success: true });
      useAdmin.mockReturnValue({
        getOnboardingTemplates: jest.fn().mockResolvedValue({ templates: mockTemplates }),
        createTemplate: jest.fn(),
        updateTemplate: jest.fn(),
        deleteTemplate: mockDelete,
        loading: false,
        error: null,
      });

      render(<Templates />);

      await waitFor(() => {
        expect(screen.getByText('Engineering Onboarding')).toBeInTheDocument();
      });

      window.confirm = jest.fn(() => true);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('1');
      });
    });

    test('does not delete if user cancels confirmation', async () => {
      const mockDelete = jest.fn();
      useAdmin.mockReturnValue({
        getOnboardingTemplates: jest.fn().mockResolvedValue({ templates: mockTemplates }),
        createTemplate: jest.fn(),
        updateTemplate: jest.fn(),
        deleteTemplate: mockDelete,
        loading: false,
        error: null,
      });

      render(<Templates />);

      await waitFor(() => {
        expect(screen.getByText('Engineering Onboarding')).toBeInTheDocument();
      });

      window.confirm = jest.fn(() => false);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  test('shows empty state when no templates exist', async () => {
    useAdmin.mockReturnValue({
      getOnboardingTemplates: jest.fn().mockResolvedValue({ templates: [] }),
      createTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      loading: false,
      error: null,
    });

    render(<Templates />);

    await waitFor(() => {
      expect(screen.getByText('No onboarding templates yet')).toBeInTheDocument();
    });
  });

  test('displays error message on load failure', async () => {
    useAdmin.mockReturnValue({
      getOnboardingTemplates: jest.fn().mockRejectedValue(new Error('Load failed')),
      createTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      loading: false,
      error: 'Load failed',
    });

    render(<Templates />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading templates/)).toBeInTheDocument();
    });
  });
});
