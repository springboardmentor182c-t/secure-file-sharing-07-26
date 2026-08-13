import React, { useState } from 'react';

/**
 * FileList Component - Secure File Sharing App
 * Renders user's files and handles file upload actions.
 */
export default function FileList({ files = [], onUpload, onDelete }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <div className="file-sharing-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>My Shared Files</h2>
      
      {/* File Upload Section */}
      <form onSubmit={handleUploadSubmit} data-testid="upload-form" style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          aria-label="choose-file"
          data-testid="file-input" 
          onChange={handleFileChange} 
        />
        <button 
          type="submit" 
          data-testid="upload-btn"
          disabled={!selectedFile}
          style={{ marginLeft: '10px', padding: '6px 16px', cursor: selectedFile ? 'pointer' : 'not-allowed' }}
        >
          Upload File
        </button>
      </form>

      {/* File Listing Section */}
      {files.length === 0 ? (
        <p data-testid="empty-state">No files uploaded yet.</p>
      ) : (
        <ul data-testid="file-list" style={{ listStyle: 'none', padding: 0 }}>
          {files.map((file) => (
            <li 
              key={file.id} 
              data-testid={`file-item-${file.id}`}
              style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>📄 {file.name} ({file.size})</span>
              {onDelete && (
                <button 
                  data-testid={`delete-btn-${file.id}`}
                  onClick={() => onDelete(file.id)}
                  style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
