import React from "react";
import ModalShell from "../../../components/common/ModalShell";

export default function DeleteConfirmationModal({ link, onClose, onConfirm, isSaving }) {
  return (
    <ModalShell title="Delete shared link" onClose={onClose} labelledBy="delete-link-title"
      footer={(
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={() => onConfirm(link.id)} disabled={isSaving}>
            {isSaving ? "Deleting…" : "Delete link"}
          </button>
        </>
      )}
    >
      <p className="modal__text">
        Are you sure you want to delete the link for <strong>{link.fileName}</strong>? Anyone with the
        link ({link.shareUrl}) will immediately lose access. This action can't be undone.
      </p>
    </ModalShell>
  );
}
