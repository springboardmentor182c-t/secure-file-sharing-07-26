import React from "react";

export default function SummaryError({ message, onRetry }) {
  return (
    <div className="summary-error">
      <p>{message || "Something went wrong generating the summary."}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Retry
        </button>
      )}
    </div>
  );
}