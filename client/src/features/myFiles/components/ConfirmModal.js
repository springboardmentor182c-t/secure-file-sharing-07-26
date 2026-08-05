import React from "react";
import ModalShell from "../../../components/common/ModalShell";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", onClose, onConfirm, isSaving }) {
  return (
    <ModalShell
      title={title}
      onClose={onClose}
      labelledBy="confirm-modal-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Working…" : confirmLabel}
          </button>
        </>
      )}
    >
      <p className="modal__text">{message}</p>
    </ModalShell>
  );
}
