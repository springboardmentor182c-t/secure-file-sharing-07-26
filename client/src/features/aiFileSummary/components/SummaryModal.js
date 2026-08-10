import React, { useEffect } from "react";
import ModalShell from "../../../components/common/ModalShell";
import SummaryPanel from "./SummaryPanel";
import { useFileSummary } from "../hooks/useFileSummary";

export default function SummaryModal({ file, onClose }) {
  const { status, summary, error, generate, checkExisting } = useFileSummary(file.id);

  // On open: check if a summary already exists (or is mid-generation from
  // a previous click) before showing the "Generate" button.
  useEffect(() => {
    checkExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.id]);

  const showGenerateButton = status === "idle" || status === "not_generated" || status === "failed";

  return (
    <ModalShell
      title={`AI Summary — ${file.original_filename}`}
      onClose={onClose}
      labelledBy="summary-modal-title"
      footer={(
        <button type="button" className="btn btn--ghost" onClick={onClose}>Close</button>
      )}
    >
      <div className="summary-modal__body">
        {showGenerateButton && (
          <>
            <p className="modal__text">
              Generate an AI summary of this document's contents. Supported formats: PDF, DOCX, TXT.
            </p>
            <button type="button" className="btn btn--primary summary-modal__generate-btn" onClick={generate}>
              Generate Summary
            </button>
          </>
        )}
        <SummaryPanel status={status} summary={summary} error={error} onRetry={generate} />
      </div>
    </ModalShell>
  );
}