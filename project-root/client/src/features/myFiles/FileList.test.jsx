import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileList from './FileList';

describe('FileList Frontend Components & Integration Tests', () => {

  /**
   * Frontend Test Case 1: Empty State and File List Rendering
   * Tests that the component renders the empty message when no files exist,
   * and properly lists file names when files array is provided.
   */
  test('renders empty state message when no files are provided and lists files when array is populated', () => {
    // 1. Render with empty files list
    const { rerender } = render(<FileList files={[]} />);
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No files uploaded yet.');
    expect(screen.queryByTestId('file-list')).not.toBeInTheDocument();

    // 2. Rerender with sample files list
    const sampleFiles = [
      { id: 1, name: 'document.pdf', size: '2.5 MB' },
      { id: 2, name: 'project_notes.txt', size: '500 KB' },
    ];
    rerender(<FileList files={sampleFiles} />);

    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.getByTestId('file-list')).toBeInTheDocument();
    expect(screen.getByTestId('file-item-1')).toHaveTextContent('document.pdf (2.5 MB)');
    expect(screen.getByTestId('file-item-2')).toHaveTextContent('project_notes.txt (500 KB)');
  });

  /**
   * Frontend Test Case 2: File Selection & Upload Trigger Interaction
   * Tests user selecting a file, enabling the upload button, and triggering the upload handler.
   */
  test('enables upload button on file selection and invokes onUpload callback on submit', () => {
    const handleUploadMock = jest.fn();
    render(<FileList files={[]} onUpload={handleUploadMock} />);

    const uploadButton = screen.getByTestId('upload-btn');
    const fileInput = screen.getByTestId('file-input');

    // Initially button should be disabled without file selection
    expect(uploadButton).toBeDisabled();

    // Create file object for test
    const file = new File(['test content'], 'test_upload.png', { type: 'image/png' });

    // Simulate file input change event
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Button should now be enabled
    expect(uploadButton).not.toBeDisabled();

    // Fire form upload action
    fireEvent.click(uploadButton);

    // Verify mock callback triggered with exact file
    expect(handleUploadMock).toHaveBeenCalledTimes(1);
    expect(handleUploadMock).toHaveBeenCalledWith(file);
  });

});
