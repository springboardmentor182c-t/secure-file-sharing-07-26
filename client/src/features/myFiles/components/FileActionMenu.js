import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  DownloadIcon, EditIcon, MoreIcon, MoveIcon, PowerIcon, ShareIcon, StarIcon, TrashIcon,
} from "../../../layout/icons";
import { Sparkles as SparklesIcon } from "lucide-react";

export default function FileActionMenu({
  file, isTrash,
  onDownload, onShare, onStar, onRename, onMove, onCategory, onTrash, onRestore, onPermanentDelete,onSummarize,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = isTrash ? 100 : 280;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top;
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 6;
      } else {
        top = rect.bottom + 6;
      }

      const left = Math.max(10, rect.right - 170);
      setCoords({ top, left });
    }
    setOpen((o) => !o);
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        close();
      }
    }

    function handleScrollOrResize() {
      close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  return (
    <div className="action-menu">
      <button
        ref={triggerRef}
        type="button"
        className="action-menu__trigger"
        aria-label={`More actions for ${file.original_filename}`}
        onClick={toggle}
      >
        <MoreIcon width={16} height={16} />
      </button>
      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="action-menu__dropdown action-menu__dropdown--portal"
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 99999,
          }}
          role="menu"
        >
          {!isTrash && (
            <>
              <button type="button" onClick={() => { onDownload(); close(); }}>
                <DownloadIcon width={14} height={14} /> Download
              </button>
              <button type="button" onClick={() => { onShare(); close(); }}>
                <ShareIcon width={14} height={14} /> Create shared link
              </button>

              <button type="button" onClick={() => { onSummarize(); close(); }}>
                <SparklesIcon width={14} height={14} /> Generate AI Summary
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
        </div>,
        document.body
      )}
    </div>
  );
}
