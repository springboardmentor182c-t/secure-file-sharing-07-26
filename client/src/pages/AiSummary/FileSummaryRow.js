import React from "react";
import { useFileSummary } from "../../features/aiFileSummary/hooks/useFileSummary";
import SummaryButton from "../../features/aiFileSummary/components/SummaryButton";
import SummaryPanel from "../../features/aiFileSummary/components/SummaryPanel";

export default function FileSummaryRow({ file }) {
  const { status, summary, error, generate } = useFileSummary(file.id);

  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>{file.file_name}</strong>
          <div style={{ fontSize: "12px", opacity: 0.6 }}>
            {file.file_extension} •{" "}
            {new Date(file.uploaded_at).toLocaleDateString()}
          </div>
        </div>
        <SummaryButton status={status} onClick={generate} />
      </div>

      <div style={{ marginTop: "12px" }}>
        <SummaryPanel
          status={status}
          summary={summary}
          error={error}
          onRetry={generate}
        />
      </div>
    </div>
  );
}