import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileSummaryPanel from './FileSummaryPanel';
import useFileSummary from '../hooks/useFileSummary';

jest.mock('../hooks/useFileSummary');

test('shows accessible generation options and submits them', () => {
  const generate = jest.fn();
  useFileSummary.mockReturnValue({ summary: null, loading: false, error: '', generate, regenerate: jest.fn() });
  render(<FileSummaryPanel file={{ id: 7, original_name: 'report.pdf' }} onClose={jest.fn()} />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Generate summary' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'Hindi' } });
  fireEvent.click(screen.getByRole('button', { name: 'Generate summary' }));
  expect(generate).toHaveBeenCalledWith(expect.objectContaining({ output_language: 'Hindi' }));
});

test('renders completed summary, key points and copy action', async () => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
  useFileSummary.mockReturnValue({
    loading: false, error: '', generate: jest.fn(), regenerate: jest.fn(),
    summary: { id: 1, status: 'completed', title: 'Report', summary_text: 'Safe summary.', key_points: ['First point'], keywords: ['security'], provider: 'ollama', source_file_version: 2, updated_at: '2026-07-28T00:00:00Z' },
  });
  render(<FileSummaryPanel file={{ id: 7, original_name: 'report.pdf' }} onClose={jest.fn()} />);
  expect(screen.getByText('Safe summary.')).toBeInTheDocument();
  expect(screen.getByText('First point')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copy summary' }));
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
  expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
});
