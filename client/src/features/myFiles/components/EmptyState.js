import React from "react";
import { FolderIcon, TrashIcon, StarIcon } from "../../../layout/icons";

const CONFIG = {
  trash: { Icon: TrashIcon, title: "Trash is empty", desc: "Files you delete will show up here." },
  starred: { Icon: StarIcon, title: "No starred files", desc: "Star a file to pin it here for quick access." },
  files: { Icon: FolderIcon, title: "No files yet", desc: "Upload your first file to get started." },
};

export default function EmptyState({ view, hasFilters, onClearFilters, onUpload }) {
  const { Icon, title, desc } = CONFIG[view] || CONFIG.files;

  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon width={26} height={26} /></div>
      <h3 className="empty-state__title">{hasFilters ? "No files match your search" : title}</h3>
      <p className="empty-state__desc">
        {hasFilters ? "Try a different keyword or clear your filters." : desc}
      </p>
      {hasFilters ? (
        <button type="button" className="btn btn--ghost" onClick={onClearFilters}>Clear filters</button>
      ) : view === "files" ? (
        <button type="button" className="btn btn--primary" onClick={onUpload}>Upload a file</button>
      ) : null}
    </div>
  );
}
