import React, { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";

export default function MoveModal({ file, folders, onClose, onSave, isSaving }) {
  const [folderId, setFolderId] = useState(file.folder_id || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave(folderId || null);
  }

  return (
    <ModalShell
      title={`Move "${file.original_filename}"`}
      onClose={onClose}
      labelledBy="move-modal-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" form="move-form" className="btn btn--primary" disabled={isSaving}>
            {isSaving ? "Moving…" : "Move"}
          </button>
        </>
      )}
    >
      <form id="move-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="move-folder">Destination</label>
          <select id="move-folder" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            <option value="">All files (root)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </form>
    </ModalShell>
  );
}
