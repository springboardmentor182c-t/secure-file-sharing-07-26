import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../layout/icons";

function getPageList(current, total) {
  const pages = [];
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - window && p <= current + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

export default function Pagination({ page, totalPages, onChange, totalCount, pageSize }) {
  if (totalCount === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);

  return (
    <div className="pagination">
      <span className="pagination__summary">
        Showing {start}-{end} of {totalCount}
      </span>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__nav-btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon width={16} height={16} />
        </button>
        {getPageList(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination__page-btn${p === page ? " pagination__page-btn--active" : ""}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="pagination__nav-btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
