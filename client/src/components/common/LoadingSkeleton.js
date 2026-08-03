import React from "react";

export default function LoadingSkeleton({ rows = 6 }) {
  return (
    <div className="skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <span className="skeleton-block skeleton-block--icon" />
          <span className="skeleton-block skeleton-block--wide" />
          <span className="skeleton-block" />
          <span className="skeleton-block skeleton-block--narrow" />
          <span className="skeleton-block skeleton-block--narrow" />
          <span className="skeleton-block skeleton-block--narrow" />
        </div>
      ))}
    </div>
  );
}
