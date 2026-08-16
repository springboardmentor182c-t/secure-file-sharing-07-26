import React, { useState } from "react";
import {
  DownloadIcon, EditIcon, MoreIcon, MoveIcon, PowerIcon, ShareIcon, StarIcon, TrashIcon,
} from "../../../layout/icons";

export default function FileActionMenu({
  file, isTrash,
  onDownload, onShare, onStar, onRename, onMove, onCategory, onTrash, onRestore, onPermanentDelete,
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="action-menu">
      <button
        type="button"
        className="action-menu__trigger"
        aria-label={`More actions for ${file.original_filename}`}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreIcon width={16} height={16} />
      </button>
      {open && (
        <div className="action-menu__dropdown" role="menu">
          {!isTrash && (
            <>
              <button type="button" onClick={() => { onDownload(); close(); }}>
                <DownloadIcon width={14} height={14} /> Download
              </button>
              <button type="button" onClick={() => { onShare(); close(); }}>
                <ShareIcon width={14} height={14} /> Create shared link
              </button>
              <button type="button" onClick={() => { onStar(); close(); }}>
                <StarIcon width={14} height={14} /> {file.is_starred ? "Unstar" : "Star"}
              </button>
              <button type="button" onClick={() => { onRename(); close(); }}>
                <EditIcon width={14} height={14} /> Rename
              </button>
              <button type="button" onClick={() => { onMove(); close(); }}>
                <MoveIcon width={14} height={14} /> Move
              </button>
              <button type="button" onClick={() => { onCategory(); close(); }}>
                <EditIcon width={14} height={14} /> Change category
              </button>
              <button type="button" className="action-menu__danger" onClick={() => { onTrash(); close(); }}>
                <TrashIcon width={14} height={14} /> Move to Trash
              </button>
            </>
          )}
          {isTrash && (
            <>
              <button type="button" onClick={() => { onRestore(); close(); }}>
                <PowerIcon width={14} height={14} /> Restore
              </button>
              <button type="button" className="action-menu__danger" onClick={() => { onPermanentDelete(); close(); }}>
                <TrashIcon width={14} height={14} /> Delete permanently
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
