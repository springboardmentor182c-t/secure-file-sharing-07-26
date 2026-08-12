import React from "react";

export default function SummaryLoadingSkeleton() {
  return (
    <div className="summary-loading-skeleton">
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}