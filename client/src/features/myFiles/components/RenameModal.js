import React, { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";

export default function RenameModal({ title, initialName, onClose, onSave, isSaving }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be blank.");
      return;
    }
    onSave(name.trim());
  }

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      labelledBy="rename-modal-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" form="rename-form" className="btn btn--primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </button>
        </>
      )}
    >
      <form id="rename-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="rename-input">Name</label>
          <input
            id="rename-input"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!error}
          />
          {error && <span className="form-field__error">{error}</span>}
        </div>
      </form>
    </ModalShell>
  );
}
