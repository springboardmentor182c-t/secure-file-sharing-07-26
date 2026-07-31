import React from "react";
import SummaryLoadingSkeleton from "./SummaryLoadingSkeleton";
import SummaryError from "./SummaryError";

export default function SummaryPanel({ status, summary, error, onRetry }) {
  if (status === "pending") {
    return <SummaryLoadingSkeleton />;
  }

  if (status === "failed" || error) {
    return <SummaryError message={error} onRetry={onRetry} />;
  }

  if (status === "completed" && summary) {
    return (
      <div className="summary-panel">
        <h4>AI Summary</h4>
        <p>{summary}</p>
      </div>
    );
  }

  return null; // idle / not_generated — nothing to show yet
}