/**
 * Admin Settings Page Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSettings from '../../../pages/admin/Settings';

// Mock the useAdmin hook
jest.mock('../../../hooks/useAdmin', () => ({
  useAdmin: jest.fn(),
}));

import { useAdmin } from '../../../hooks/useAdmin';

describe('Admin Settings Page', () => {
  const mockSettings = {
    companyName: 'V.Two',
    logo: 'https://example.com/logo.png',
    timezone: 'EST',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpFrom: 'noreply@vtwo.co',
    phases: {
      preBoard: 'Pre-boarding',
      day1: 'Day 1',
      week1: 'Week 1',
      day30: '30-day',
      day90: '90-day',
    },
    features: {
      chatEnabled: true,
      autoAssignEnabled: true,
      notificationsEnabled: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAdmin.mockReturnValue({
      getSettings: jest.fn().mockResolvedValue({ settings: mockSettings }),
      updateSettings: jest.fn().mockResolvedValue({ settings: mockSettings }),
      loading: false,
      error: null,
    });
  });

  test('renders page title and description', async () => {
    render(<AdminSettings />);

    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText(/Configure company information/)).toBeInTheDocument();
  });

  test('loads and displays settings', async () => {
    render(<AdminSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
      expect(screen.getByDisplayValue('EST')).toBeInTheDocument();
    });
  });

  describe('Company Information Section', () => {
    test('renders company information fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com/logo.png')).toBeInTheDocument();
      });
    });

    test('allows editing company name', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
      });

      const companyInput = screen.getByDisplayValue('V.Two');
      fireEvent.change(companyInput, { target: { value: 'V.Two Inc' } });

      expect(companyInput).toHaveValue('V.Two Inc');
    });

    test('allows editing timezone', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('EST')).toBeInTheDocument();
      });

      const timezoneSelect = screen.getByDisplayValue('EST');
      fireEvent.change(timezoneSelect, { target: { value: 'PST' } });

      expect(timezoneSelect).toHaveValue('PST');
    });
  });

  describe('Email Settings Section', () => {
    test('renders email configuration fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('smtp.gmail.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('587')).toBeInTheDocument();
        expect(screen.getByDisplayValue('noreply@vtwo.co')).toBeInTheDocument();
      });
    });

    test('allows editing SMTP host', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('smtp.gmail.com')).toBeInTheDocument();
      });

      const smtpInput = screen.getByDisplayValue('smtp.gmail.com');
      fireEvent.change(smtpInput, { target: { value: 'smtp.outlook.com' } });

      expect(smtpInput).toHaveValue('smtp.outlook.com');
    });

    test('allows editing SMTP port', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('587')).toBeInTheDocument();
      });

      const portInput = screen.getByDisplayValue('587');
      fireEvent.change(portInput, { target: { value: '465' } });

      expect(portInput).toHaveValue(465);
    });
  });

  describe('Onboarding Phases Section', () => {
    test('renders onboarding phase fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pre-boarding')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Day 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Week 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('30-day')).toBeInTheDocument();
        expect(screen.getByDisplayValue('90-day')).toBeInTheDocument();
      });
    });

    test('allows editing phase names', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pre-boarding')).toBeInTheDocument();
      });

      const preBoardInput = screen.getByDisplayValue('Pre-boarding');
      fireEvent.change(preBoardInput, { target: { value: 'Welcome' } });

      expect(preBoardInput).toHaveValue('Welcome');
    });
  });

  describe('Feature Flags Section', () => {
    test('renders feature flag checkboxes', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });

    test('allows toggling feature flags', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0];
      const initialState = firstCheckbox.checked;

      fireEvent.click(firstCheckbox);

      expect(firstCheckbox.checked).toBe(!initialState);
    });
  });

  describe('Form Submission', () => {
    test('validates company name is required', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
      });

      const companyInput = screen.getByDisplayValue('V.Two');
      fireEvent.change(companyInput, { target: { value: '' } });

      const submitButton = screen.getByText(/Save Settings/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Company name is required/)).toBeInTheDocument();
      });
    });

    test('submits form with all settings', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ settings: mockSettings });
      useAdmin.mockReturnValue({
        getSettings: jest.fn().mockResolvedValue({ settings: mockSettings }),
        updateSettings: mockUpdate,
        loading: false,
        error: null,
      });

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/Save Settings/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });
    });

    test('shows success message on save', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/Save Settings/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Settings saved successfully/)).toBeInTheDocument();
      });
    });

    test('shows error message on save failure', async () => {
      useAdmin.mockReturnValue({
        getSettings: jest.fn().mockResolvedValue({ settings: mockSettings }),
        updateSettings: jest.fn().mockRejectedValue(new Error('Save failed')),
        loading: false,
        error: 'Save failed',
      });

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/Save Settings/);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error saving settings/)).toBeInTheDocument();
      });
    });
  });

  test('disables submit button while loading', async () => {
    useAdmin.mockReturnValue({
      getSettings: jest.fn().mockResolvedValue({ settings: mockSettings }),
      updateSettings: jest.fn(),
      loading: true,
      error: null,
    });

    render(<AdminSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('V.Two')).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Saving.../);
    expect(submitButton).toBeDisabled();
  });
});
