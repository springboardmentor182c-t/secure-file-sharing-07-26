import React from "react";
import TableRow from "./TableRow";
import Pagination from "../../../components/common/Pagination";
import EmptyState from "./EmptyState";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import { ChevronDownIcon } from "../../../layout/icons";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "most-downloaded", label: "Most Downloaded" },
  { value: "alphabetical", label: "Alphabetical" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
  { value: "disabled", label: "Disabled" },
];

export default function SharedLinksTable({
  isLoading,
  links,
  totalCount,
  page,
  totalPages,
  onPageChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  hasActiveFilters,
  onClearFilters,
  onCreate,
  onCopy,
  onEdit,
  onToggleEnabled,
  onDelete,
}) {
  return (
    <div className="links-panel">
      <div className="links-panel__toolbar">
        <h2 className="links-panel__title">Shared links</h2>
        <div className="links-panel__controls">
          <div className="select-wrap">
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDownIcon className="select-wrap__chevron" width={14} height={14} />
          </div>
          <div className="select-wrap">
            <select
              className="select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort links"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>Sort: {o.label}</option>
              ))}
            </select>
            <ChevronDownIcon className="select-wrap__chevron" width={14} height={14} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : links.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClearFilters={onClearFilters} onCreate={onCreate} />
      ) : (
        <>
          <div className="links-table__scroll">
            <table className="links-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Link</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Views</th>
                  <th>Downloads</th>
                  <th>Access</th>
                  <th>Status</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <TableRow
                    key={link.id}
                    link={link}
                    onCopy={onCopy}
                    onEdit={onEdit}
                    onToggleEnabled={onToggleEnabled}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
            totalCount={totalCount}
            pageSize={10}
          />
        </>
      )}
    </div>
  );
}
