import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

// Mock fetch globally
global.fetch = jest.fn();

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  it('should render search input', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(input.closest('form'));

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should not call onSearch for empty query', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.submit(input.closest('form'));

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should fetch suggestions when query length >= 2', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: ['John Doe', 'John Smith'],
            count: 2,
          }),
      })
    );

    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(input, { target: { value: 'John' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search/suggestions?prefix=John'),
        expect.any(Object)
      );
    });
  });

  it('should not fetch suggestions for short query', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(input, { target: { value: 'a' } });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should display suggestions', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: ['John Doe', 'John Smith'],
            count: 2,
          }),
      })
    );

    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('should handle suggestion click', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: ['John Doe'],
            count: 1,
          }),
      })
    );

    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search candidates/i);
    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestion = screen.getByText('John Doe');
      fireEvent.click(suggestion);
    });

    expect(mockOnSearch).toHaveBeenCalledWith('John Doe');
  });

  it('should have search button', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
