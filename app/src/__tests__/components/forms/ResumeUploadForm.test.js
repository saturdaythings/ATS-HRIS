/**
 * ResumeUploadForm Component Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeUploadForm from '../../../components/forms/ResumeUploadForm';

describe('ResumeUploadForm Component', () => {
  const mockOnUpload = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnUpload.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders drag-drop zone', () => {
    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('Drag and drop your resume here')).toBeInTheDocument();
  });

  test('shows file type requirements', () => {
    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('PDF or DOCX, max 10MB')).toBeInTheDocument();
  });

  test('shows error for invalid file type', async () => {
    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );

    const input = screen.getByRole('generic').querySelector('input[type="file"]');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Only PDF and DOCX files are accepted')).toBeInTheDocument();
    });
  });

  test('shows error for file size exceeding limit', async () => {
    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );

    const input = screen.getByRole('generic').querySelector('input[type="file"]');
    const largeFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)],
      'large.pdf',
      { type: 'application/pdf' }
    );

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File size must be less than 10MB')).toBeInTheDocument();
    });
  });

  test('accepts valid PDF file and shows upload progress', async () => {
    jest.useFakeTimers();

    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );

    const input = screen.getByRole('generic').querySelector('input[type="file"]');
    const file = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Upload successful')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('accepts valid DOCX file', async () => {
    jest.useFakeTimers();

    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );

    const input = screen.getByRole('generic').querySelector('input[type="file"]');
    const file = new File(
      ['test content'],
      'resume.docx',
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Upload successful')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('shows Done button after successful upload', async () => {
    jest.useFakeTimers();

    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );

    const input = screen.getByRole('generic').querySelector('input[type="file"]');
    const file = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('calls onCancel when Cancel button is clicked', async () => {
    jest.useFakeTimers();

    render(
      <ResumeUploadForm onUpload={mockOnUpload} onCancel={mockOnCancel} />
    );

    const input = screen.getByRole('generic').querySelector('input[type="file"]');
    const file = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      const doneButton = screen.getByText('Done');
      expect(doneButton).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Done'));

    expect(mockOnCancel).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
