import React, { useState } from "react";
import ModalShell from "./ModalShell";

const initialForm = {
  fileName: "",
  fileType: "pdf",
  recipientEmail: "",
  access: "view",
  expiresAt: "",
  password: "",
  allowDownload: false,
};

export default function CreateLinkModal({ onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  function validate() {
    const errs = {};
    if (!form.fileName.trim()) errs.fileName = "File name is required.";
    if (!form.recipientEmail.trim()) {
      errs.recipientEmail = "Recipient email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.recipientEmail)) {
      errs.recipientEmail = "Enter a valid email address.";
    }
    if (form.expiresAt && new Date(form.expiresAt) < new Date().setHours(0, 0, 0, 0)) {
      errs.expiresAt = "Expiration must be in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onCreate(form);
  }

  return (
    <ModalShell title="Create shared link" onClose={onClose} labelledBy="create-link-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="create-link-form" className="btn btn--primary">Generate Link</button>
        </>
      )}
    >
      <form id="create-link-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="fileName">File</label>
          <input
            id="fileName"
            type="text"
            placeholder="e.g. Q1-Budget.pdf"
            value={form.fileName}
            onChange={(e) => setField("fileName", e.target.value)}
            aria-invalid={!!errors.fileName}
          />
          {errors.fileName && <span className="form-field__error">{errors.fileName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="fileType">File type</label>
          <select id="fileType" value={form.fileType} onChange={(e) => setField("fileType", e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="zip">Archive (zip)</option>
            <option value="img">Image</option>
          </select>
        </div>

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
