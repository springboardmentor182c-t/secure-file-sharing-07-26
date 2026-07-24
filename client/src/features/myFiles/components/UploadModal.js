import React, { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import { FolderIcon } from "../../../layout/icons";

export default function UploadModal({ folders, currentFolderId, selectedFiles, onClose, onUpload, isSaving }) {
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId || null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      await onUpload(selectedFolderId);
    } finally {
      setUploading(false);
    }
  }

  const fileCount = selectedFiles?.length || 0;

  return (
    <ModalShell
      title="Select Folder for Upload"
      onClose={onClose}
      labelledBy="upload-modal-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving || uploading}>
            Cancel
          </button>
          <button type="submit" form="upload-form" className="btn btn--primary" disabled={isSaving || uploading}>
            {uploading ? "Uploading…" : "Proceed"}
          </button>
        </>
      )}
    >
      <form id="upload-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>Uploading</label>
          <div className="upload-modal__summary">
            <p>{fileCount} file{fileCount === 1 ? "" : "s"} selected</p>
            <p className="upload-modal__hint">Choose a destination folder below.</p>
          </div>
        </div>

        <div className="form-field">
          <label>Select Destination Folder</label>
          <div className="upload-modal__folder-list">
            <button
              type="button"
              className={`upload-modal__folder-item ${selectedFolderId === null ? "upload-modal__folder-item--active" : ""}`}
              onClick={() => setSelectedFolderId(null)}
            >
              <FolderIcon width={16} height={16} />
              <span>Root (My Files)</span>
            </button>
            {folders.length === 0 && (
              <p className="upload-modal__empty">No folders created yet. Files will be uploaded to Root.</p>
            )}
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className={`upload-modal__folder-item ${selectedFolderId === folder.id ? "upload-modal__folder-item--active" : ""}`}
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <FolderIcon width={16} height={16} />
                <span>{folder.name}</span>
                <span className="upload-modal__folder-count">{folder.file_count}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
