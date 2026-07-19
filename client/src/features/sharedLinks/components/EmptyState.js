import React from "react";
import { LinkIcon } from "../../../layout/icons";

export default function EmptyState({ hasFilters, onClearFilters, onCreate }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><LinkIcon width={26} height={26} /></div>
      <h3 className="empty-state__title">
        {hasFilters ? "No links match your search" : "No shared links yet"}
      </h3>
      <p className="empty-state__desc">
        {hasFilters
          ? "Try a different keyword or clear your filters."
          : "Create your first secure link to start sharing files."}
      </p>
      {hasFilters ? (
        <button type="button" className="btn btn--ghost" onClick={onClearFilters}>
          Clear filters
        </button>
      ) : (
        <button type="button" className="btn btn--primary" onClick={onCreate}>
          + New link
        </button>
      )}
    </div>
  );
}
