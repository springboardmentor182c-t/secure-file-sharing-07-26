import React from "react";
import FileRow from "./FileRow";
import EmptyState from "./EmptyState";
import Pagination from "../../../components/common/Pagination";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import { ChevronDownIcon } from "../../../layout/icons";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name (A–Z)" },
  { value: "size_desc", label: "Largest first" },
  { value: "size", label: "Smallest first" },
];

export default function FileTable({
  view, isLoading, files, totalCount, page, totalPages, onPageChange,
  sortBy, onSortChange, hasActiveFilters, onClearFilters, onUploadClick,
  selectedIds, onToggleSelect, onToggleSelectAll,
  onDownload, onShare, onStar, onRename, onMove, onCategory, onTrash, onRestore, onPermanentDelete,
  onBulkTrash, onBulkPermanentDelete,
}) {
  const isTrash = view === "trash";
  const allSelected = files.length > 0 && selectedIds.length === files.length;

  return (
    <div className="links-panel">
      <div className="links-panel__toolbar">
        <h2 className="links-panel__title">
          {view === "trash" ? "Trash" : view === "starred" ? "Starred files" : "Files"}
        </h2>
        <div className="links-panel__controls">
          {selectedIds.length > 0 && (
            isTrash ? (
              <button type="button" className="btn btn--danger" onClick={onBulkPermanentDelete}>
                Delete {selectedIds.length} permanently
              </button>
            ) : (
              <button type="button" className="btn btn--danger" onClick={onBulkTrash}>
                Move {selectedIds.length} to Trash
              </button>
            )
          )}
          <div className="select-wrap">
            <select className="select" value={sortBy} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort files">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
            </select>
            <ChevronDownIcon className="select-wrap__chevron" width={14} height={14} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : files.length === 0 ? (
        <EmptyState view={view} hasFilters={hasActiveFilters} onClearFilters={onClearFilters} onUpload={onUploadClick} />
      ) : (
        <>
          <div className="links-table__scroll">
            <table className="links-table files-table">
              <thead>
                <tr>
                  <th className="files-table__checkbox-cell">
                    <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all files" />
                  </th>
                  <th>Name</th>
                  <th>Modified</th>
                  <th>Size</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    isTrash={isTrash}
                    selected={selectedIds.includes(file.id)}
                    onToggleSelect={onToggleSelect}
                    onDownload={onDownload}
                    onShare={onShare}
                    onStar={onStar}
                    onRename={onRename}
                    onMove={onMove}
                    onCategory={onCategory}
                    onTrash={onTrash}
                    onRestore={onRestore}
                    onPermanentDelete={onPermanentDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} totalCount={totalCount} pageSize={10} />
        </>
      )}
    </div>
  );
}
