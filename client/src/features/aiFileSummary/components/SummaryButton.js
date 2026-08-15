import React from "react";

export default function SummaryButton({ status, onClick }) {
  const isLoading = status === "pending";

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="summary-button"
    >
      {isLoading ? "Summarizing..." : "Generate Summary"}
    </button>
  );
}