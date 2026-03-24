import { render, screen, waitFor } from '@testing-library/react';
import Reports from '../../pages/Reports';

// Mock fetch globally
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
global.URL.revokeObjectURL = jest.fn();

describe('Reports Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  it('should render reports page with title', () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({ ok: false })
    );

    render(<Reports />);

    expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/View insights and export data/i)).toBeInTheDocument();
  });

  it('should display all report cards', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ total: 0, data: [] }),
      })
    );

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('Candidate Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Employee Directory')).toBeInTheDocument();
      expect(screen.getByText('Device Inventory')).toBeInTheDocument();
      expect(screen.getByText('Activity Log')).toBeInTheDocument();
    });
  });

  it('should have export buttons for each report', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ total: 10, data: [] }),
      })
    );

    render(<Reports />);

    await waitFor(() => {
      const exportButtons = screen.getAllByText('Export');
      expect(exportButtons.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should display quick stats section', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ total: 42, data: [] }),
      })
    );

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText('Total Records')).toBeInTheDocument();
    });
  });
});
