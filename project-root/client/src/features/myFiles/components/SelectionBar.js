import { CheckSquare, Square, Trash2, X } from 'lucide-react';

export default function SelectionBar({
  count,
  totalVisible,
  allSelected,
  onSelectAll,
  onClear,
  onBulkDelete,
}) {
  return (
    <div className="my-files-selection-bar">
      <div className="my-files-selection-left">
        <button
          type="button"
          className="my-files-select-all-btn"
          onClick={onSelectAll}
          title={allSelected ? 'Deselect all' : 'Select all'}
        >
          {allSelected ? (
            <CheckSquare size={16} strokeWidth={2.2} />
          ) : (
            <Square size={16} strokeWidth={2.2} />
          )}
        </button>
        <span className="my-files-selection-count">
          <strong>{count}</strong> of {totalVisible} selected
        </span>
      </div>

      <div className="my-files-selection-actions">
        <button
          type="button"
          className="my-files-btn my-files-btn--danger my-files-btn--compact"
          onClick={onBulkDelete}
        >
          <Trash2 size={14} strokeWidth={2.2} />
          Delete
        </button>
        <button
          type="button"
          className="my-files-btn my-files-btn--secondary my-files-btn--compact"
          onClick={onClear}
        >
          <X size={14} strokeWidth={2.2} />
          Cancel
        </button>
      </div>
    </div>
  );
}