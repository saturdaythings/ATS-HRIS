import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Search from '../../pages/Search';

// Mock fetch globally
global.fetch = jest.fn();

describe('Search Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  it('should render search page with title', () => {
    render(<Search />);

    expect(screen.getByText(/Global Search/i)).toBeInTheDocument();
    expect(screen.getByText(/Search across candidates/i)).toBeInTheDocument();
  });

  it('should have search input field', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    expect(input).toBeInTheDocument();
  });

  it('should show help text when no query', () => {
    render(<Search />);

    expect(screen.getByText(/Start typing to search/i)).toBeInTheDocument();
    expect(screen.getByText(/Try searching for:/i)).toBeInTheDocument();
  });

  it('should have type filter dropdown', () => {
    render(<Search />);

    const select = screen.getByDisplayValue('All Types');
    expect(select).toBeInTheDocument();
  });

  it('should handle search query', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: 'test',
            results: [
              {
                id: '1',
                type: 'candidate',
                name: 'John Doe',
                subtitle: 'Engineer • active',
              },
            ],
            total: 1,
          }),
      })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText(/Search candidates/i);

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?q=test'),
        expect.any(Object)
      );
    });
  });

  it('should display search results', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: 'John',
            results: [
              {
                id: '1',
                type: 'candidate',
                name: 'John Doe',
                subtitle: 'Engineer • active',
                description: 'john@example.com',
              },
            ],
            total: 1,
          }),
      })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText(/Search candidates/i);

    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Engineer • active/)).toBeInTheDocument();
    });
  });

  it('should handle type filter change', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: 'test',
            results: [],
            total: 0,
          }),
      })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form'));

    const select = screen.getByDisplayValue('All Types');
    fireEvent.change(select, { target: { value: 'candidates' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should handle no results', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: 'nonexistent',
            results: [],
            total: 0,
          }),
      })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText(/Search candidates/i);

    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    });
  });

  it('should handle search error', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
      })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText(/Search candidates/i);

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Search failed/i)).toBeInTheDocument();
    });
  });
});
