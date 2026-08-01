import React, { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";
import { CATEGORIES } from "../utils/fileUtils";

export default function CategoryModal({ file, onClose, onSave, isSaving }) {
  const [category, setCategory] = useState(file.category);

  function handleSubmit(e) {
    e.preventDefault();
    onSave(category);
  }

  return (
    <ModalShell
      title={`Category for "${file.original_filename}"`}
      onClose={onClose}
      labelledBy="category-modal-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" form="category-form" className="btn btn--primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </button>
        </>
      )}
    >
      <form id="category-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="category-select">Category</label>
          <select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </form>
    </ModalShell>
  );
}
