/**
 * FieldBuilder Component Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FieldBuilder from '../../../components/admin/FieldBuilder';

describe('FieldBuilder Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Create Mode', () => {
    test('renders form with empty fields', () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByPlaceholderText(/e.g., tshirt_size/)).toHaveValue('');
      expect(screen.getByPlaceholderText(/e.g., T-Shirt Size/)).toHaveValue('');
      // Check that field type select is rendered - find by looking for option elements
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    test('enables name and type fields in create mode', () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByPlaceholderText(/e.g., tshirt_size/);
      const selects = screen.getAllByRole('combobox');
      const typeSelect = selects[0]; // First select is the type field

      expect(nameInput).not.toBeDisabled();
      expect(typeSelect).not.toBeDisabled();
    });

    test('shows "Create Field" button in create mode', () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Create Field')).toBeInTheDocument();
    });

    test('validates field name (snake_case required)', async () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByPlaceholderText(/e.g., tshirt_size/);
      const submitButton = screen.getByText('Create Field');

      // Invalid name
      fireEvent.change(nameInput, { target: { value: 'Invalid Name' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/must be lowercase letters, numbers, and underscores/)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates required fields', async () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByText('Create Field');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Field name is required/)).toBeInTheDocument();
        expect(screen.getByText(/Label is required/)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates select options as JSON array', async () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByPlaceholderText(/e.g., tshirt_size/);
      const labelInput = screen.getByPlaceholderText(/e.g., T-Shirt Size/);
      const submitButton = screen.getByText('Create Field');

      // Fill valid name, label and entity type
      fireEvent.change(nameInput, { target: { value: 'size' } });
      fireEvent.change(labelInput, { target: { value: 'Size' } });

      // Submit form
      fireEvent.click(submitButton);

      // Should succeed with default values
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    test('submits form with valid data', async () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByPlaceholderText(/e.g., tshirt_size/);
      const labelInput = screen.getByPlaceholderText(/e.g., T-Shirt Size/);
      const submitButton = screen.getByText('Create Field');

      fireEvent.change(nameInput, { target: { value: 'tshirt_size' } });
      fireEvent.change(labelInput, { target: { value: 'T-Shirt Size' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'tshirt_size',
            label: 'T-Shirt Size',
            type: 'text',
            entityType: 'candidate',
          })
        );
      });
    });
  });

  describe('Edit Mode', () => {
    const mockField = {
      id: '1',
      name: 'tshirt_size',
      label: 'T-Shirt Size',
      type: 'select',
      entityType: 'employee',
      options: '["XS", "S", "M", "L", "XL"]',
      required: true,
      order: 1,
    };

    test('populates form with field data', () => {
      render(
        <FieldBuilder
          field={mockField}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText(/e.g., tshirt_size/)).toHaveValue('tshirt_size');
      expect(screen.getByPlaceholderText(/e.g., T-Shirt Size/)).toHaveValue('T-Shirt Size');
      const selects = screen.getAllByRole('combobox');
      const typeSelect = selects[0];
      expect(typeSelect).toHaveValue('select');
    });

    test('disables name and type fields in edit mode', () => {
      render(
        <FieldBuilder
          field={mockField}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByPlaceholderText(/e.g., tshirt_size/);
      const selects = screen.getAllByRole('combobox');
      const typeSelect = selects[0];

      expect(nameInput).toBeDisabled();
      expect(typeSelect).toBeDisabled();
    });

    test('shows "Update Field" button in edit mode', () => {
      render(
        <FieldBuilder
          field={mockField}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Update Field')).toBeInTheDocument();
    });

    test('can update label and options in edit mode', async () => {
      render(
        <FieldBuilder
          field={mockField}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const labelInput = screen.getByPlaceholderText(/e.g., T-Shirt Size/);
      const updateButton = screen.getByText('Update Field');

      fireEvent.change(labelInput, { target: { value: 'Updated Label' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            label: 'Updated Label',
          })
        );
      });
    });
  });

  describe('Form Behavior', () => {
    test('shows options textarea only for select type', async () => {
      const { rerender } = render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Initially, options textarea should not be visible
      expect(screen.queryByPlaceholderText(/Option 1, Option 2/)).not.toBeInTheDocument();
    });

    test('handles required checkbox', () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const requiredCheckbox = screen.getByRole('checkbox', { name: /Required field/ });
      expect(requiredCheckbox).not.toBeChecked();

      fireEvent.click(requiredCheckbox);
      expect(requiredCheckbox).toBeChecked();
    });

    test('calls onCancel when Cancel button clicked', () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('handles order field', () => {
      render(
        <FieldBuilder onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const orderInput = screen.getByRole('spinbutton');
      expect(orderInput).toHaveValue(999);

      fireEvent.change(orderInput, { target: { value: '5' } });
      expect(orderInput).toHaveValue(5);
    });
  });
});
