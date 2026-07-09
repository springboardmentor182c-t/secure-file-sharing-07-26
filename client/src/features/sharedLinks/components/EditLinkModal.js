import React, { useState } from "react";
import ModalShell from "./ModalShell";

function toDateInputValue(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditLinkModal({ link, onClose, onSave }) {
  const [form, setForm] = useState({
    access: link.access,
    expiresAt: toDateInputValue(link.expiresAt),
    password: link.passwordProtected ? "••••••••" : "",
    allowDownload: link.allowDownload,
  });
  const [errors, setErrors] = useState({});

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  function validate() {
    const errs = {};
    if (form.expiresAt && new Date(form.expiresAt) < new Date().setHours(0, 0, 0, 0)) {
      errs.expiresAt = "Expiration must be in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(link.id, {
      access: form.access,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      passwordProtected: form.password.trim().length > 0,
      allowDownload: form.allowDownload,
    });
  }

  return (
    <ModalShell title={`Edit link — ${link.fileName}`} onClose={onClose} labelledBy="edit-link-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="edit-link-form" className="btn btn--primary">Save changes</button>
        </>
      )}
    >
      <form id="edit-link-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label>File</label>
          <div className="form-static">{link.fileName}</div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="edit-access">Permission</label>
            <select id="edit-access" value={form.access} onChange={(e) => setField("access", e.target.value)}>
              <option value="view">View only</option>
              <option value="download">Download</option>
              <option value="edit">Edit</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="edit-expiresAt">Expiration</label>
            <input
              id="edit-expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setField("expiresAt", e.target.value)}
              aria-invalid={!!errors.expiresAt}
            />
            {errors.expiresAt && <span className="form-field__error">{errors.expiresAt}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="edit-password">Password protection</label>
          <input
            id="edit-password"
            type="text"
            placeholder="Leave blank for no password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
          />
        </div>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.allowDownload}
            onChange={(e) => setField("allowDownload", e.target.checked)}
          />
          Allow download
        </label>
      </form>
    </ModalShell>
  );
}
