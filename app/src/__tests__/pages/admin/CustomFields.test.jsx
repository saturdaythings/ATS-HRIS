/**
 * CustomFields Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomFields from '../../../pages/admin/CustomFields';

// Mock the useAdmin hook
jest.mock('../../../hooks/useAdmin', () => ({
  useAdmin: jest.fn(),
}));

import { useAdmin } from '../../../hooks/useAdmin';

describe('CustomFields Page', () => {
  const mockFields = [
    {
      id: '1',
      name: 'tshirt_size',
      label: 'T-Shirt Size',
      type: 'select',
      entityType: 'employee',
      options: '["XS", "S", "M", "L", "XL"]',
      required: true,
      order: 1,
    },
    {
      id: '2',
      name: 'security_level',
      label: 'Security Clearance',
      type: 'select',
      entityType: 'candidate',
      options: '["None", "Level 1", "Level 2"]',
      required: false,
      order: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAdmin.mockReturnValue({
      getCustomFields: jest.fn().mockResolvedValue({ fields: mockFields }),
      createCustomField: jest.fn().mockResolvedValue({ field: {} }),
      updateCustomField: jest.fn().mockResolvedValue({ field: {} }),
      deleteCustomField: jest.fn().mockResolvedValue({ success: true }),
      loading: false,
      error: null,
    });
  });

  test('renders page title and description', async () => {
    render(<CustomFields />);

    expect(screen.getByText('Custom Fields')).toBeInTheDocument();
    expect(screen.getByText(/Manage custom fields/)).toBeInTheDocument();
  });

  test('loads and displays custom fields', async () => {
    render(<CustomFields />);

    await waitFor(() => {
      expect(screen.getByText('tshirt_size')).toBeInTheDocument();
      expect(screen.getByText('T-Shirt Size')).toBeInTheDocument();
    });
  });

  test('renders Add Custom Field button', async () => {
    render(<CustomFields />);

    const addButton = screen.getByText('+ Add Custom Field');
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  test('opens modal when Add button clicked', async () => {
    render(<CustomFields />);

    const addButton = screen.getByText('+ Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });
  });

  test('displays field type and entity badges', async () => {
    render(<CustomFields />);

    await waitFor(() => {
      expect(screen.getByText('select')).toBeInTheDocument();
      expect(screen.getByText('employee')).toBeInTheDocument();
    });
  });

  test('shows required status', async () => {
    render(<CustomFields />);

    await waitFor(() => {
      const requiredTexts = screen.getAllByText('Yes');
      expect(requiredTexts.length).toBeGreaterThan(0);
    });
  });

  test('displays Edit and Delete buttons for each field', async () => {
    render(<CustomFields />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      expect(editButtons.length).toBe(mockFields.length);
      expect(deleteButtons.length).toBe(mockFields.length);
    });
  });

  test('calls createCustomField when form is submitted', async () => {
    const mockCreate = jest.fn().mockResolvedValue({ field: {} });
    useAdmin.mockReturnValue({
      getCustomFields: jest.fn().mockResolvedValue({ fields: [] }),
      createCustomField: mockCreate,
      updateCustomField: jest.fn(),
      deleteCustomField: jest.fn(),
      loading: false,
      error: null,
    });

    render(<CustomFields />);

    const addButton = screen.getByText('+ Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    test('filters fields by search term', async () => {
      render(<CustomFields />);

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name or label/);
      fireEvent.change(searchInput, { target: { value: 'tshirt' } });

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
        expect(screen.queryByText('security_level')).not.toBeInTheDocument();
      });
    });

    test('filters fields by type', async () => {
      render(<CustomFields />);

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'text' } });

      // Since all test fields are 'select', results should be empty
      await waitFor(() => {
        expect(screen.getByText(/No fields match your filters/)).toBeInTheDocument();
      });
    });

    test('filters fields by entity type', async () => {
      render(<CustomFields />);

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
      });

      const entitySelect = screen.getByDisplayValue('All Entities');
      fireEvent.change(entitySelect, { target: { value: 'candidate' } });

      await waitFor(() => {
        expect(screen.getByText('security_level')).toBeInTheDocument();
        expect(screen.queryByText('tshirt_size')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Functionality', () => {
    test('opens modal with field data when Edit clicked', async () => {
      render(<CustomFields />);

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Custom Field')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    test('calls deleteCustomField when Delete clicked and confirmed', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ success: true });
      useAdmin.mockReturnValue({
        getCustomFields: jest.fn().mockResolvedValue({ fields: mockFields }),
        createCustomField: jest.fn(),
        updateCustomField: jest.fn(),
        deleteCustomField: mockDelete,
        loading: false,
        error: null,
      });

      render(<CustomFields />);

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
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
        getCustomFields: jest.fn().mockResolvedValue({ fields: mockFields }),
        createCustomField: jest.fn(),
        updateCustomField: jest.fn(),
        deleteCustomField: mockDelete,
        loading: false,
        error: null,
      });

      render(<CustomFields />);

      await waitFor(() => {
        expect(screen.getByText('tshirt_size')).toBeInTheDocument();
      });

      window.confirm = jest.fn(() => false);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  test('displays error message on load failure', async () => {
    useAdmin.mockReturnValue({
      getCustomFields: jest.fn().mockRejectedValue(new Error('Load failed')),
      createCustomField: jest.fn(),
      updateCustomField: jest.fn(),
      deleteCustomField: jest.fn(),
      loading: false,
      error: 'Load failed',
    });

    render(<CustomFields />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading fields/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no fields exist', async () => {
    useAdmin.mockReturnValue({
      getCustomFields: jest.fn().mockResolvedValue({ fields: [] }),
      createCustomField: jest.fn(),
      updateCustomField: jest.fn(),
      deleteCustomField: jest.fn(),
      loading: false,
      error: null,
    });

    render(<CustomFields />);

    await waitFor(() => {
      expect(screen.getByText('No custom fields yet')).toBeInTheDocument();
    });
  });
});
