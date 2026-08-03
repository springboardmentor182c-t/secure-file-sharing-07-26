import React, { useState } from "react";
import ModalShell from "../../../components/common/ModalShell";

const initialForm = {
  file: null,
  recipientEmail: "",
  access: "view",
  expiresAt: "",
  password: "",
  allowDownload: false,
};

/**
 * Two modes:
 *  - Opened from the Shared Links screen with no `preselectedFile`: shows a
 *    real file picker, uploads it, then creates the link (unchanged
 *    behavior).
 *  - Opened from the My Files screen with `preselectedFile={id, name}`:
 *    skips the upload step entirely and creates a link straight against
 *    that existing file id - this is the integration point between the two
 *    modules (same POST /shared-links call either way, no duplicate API).
 */
export default function CreateLinkModal({ onClose, onCreate, isSaving, preselectedFile = null }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  function validate() {
    const errs = {};
    if (!preselectedFile && !form.file) errs.file = "Choose a file to share.";
    if (!form.recipientEmail.trim()) {
      errs.recipientEmail = "Recipient email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.recipientEmail)) {
      errs.recipientEmail = "Enter a valid email address.";
    }
    if (form.expiresAt && new Date(form.expiresAt) < new Date().setHours(0, 0, 0, 0)) {
      errs.expiresAt = "Expiration must be in the future.";
    }
    if (form.password && form.password.length < 4) {
      errs.password = "Password must be at least 4 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    if (preselectedFile) {
      const { file, ...rest } = form;
      onCreate({ ...rest, fileId: preselectedFile.id, fileName: preselectedFile.name });
    } else {
      onCreate(form);
    }
  }

  return (
    <ModalShell title="Create shared link" onClose={onClose} labelledBy="create-link-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" form="create-link-form" className="btn btn--primary" disabled={isSaving}>
            {isSaving ? "Generating…" : "Generate Link"}
          </button>
        </>
      )}
    >
      <form id="create-link-form" onSubmit={handleSubmit} noValidate>
        {preselectedFile ? (
          <div className="form-field">
            <label>File</label>
            <div className="form-static">{preselectedFile.name}</div>
          </div>
        ) : (
          <div className="form-field">
            <label htmlFor="file">File</label>
            <input
              id="file"
              type="file"
              onChange={(e) => setField("file", e.target.files?.[0] || null)}
              aria-invalid={!!errors.file}
            />
            {form.file && <span className="form-field__hint">{form.file.name}</span>}
            {errors.file && <span className="form-field__error">{errors.file}</span>}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="recipientEmail">Recipient email</label>
          <input
            id="recipientEmail"
            type="email"
            placeholder="name@company.com"
            value={form.recipientEmail}
            onChange={(e) => setField("recipientEmail", e.target.value)}
            aria-invalid={!!errors.recipientEmail}
          />
          {errors.recipientEmail && <span className="form-field__error">{errors.recipientEmail}</span>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="access">Permission</label>
            <select id="access" value={form.access} onChange={(e) => setField("access", e.target.value)}>
              <option value="view">View only</option>
              <option value="download">Download</option>
              <option value="edit">Edit</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="expiresAt">Expiration</label>
            <input
              id="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setField("expiresAt", e.target.value)}
              aria-invalid={!!errors.expiresAt}
            />
            {errors.expiresAt && <span className="form-field__error">{errors.expiresAt}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="password">Password protection (optional)</label>
          <input
            id="password"
            type="text"
            placeholder="Leave blank for no password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <span className="form-field__error">{errors.password}</span>}
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
