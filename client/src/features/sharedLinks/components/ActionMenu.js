import React, { useEffect, useRef, useState } from "react";
import { MoreIcon, CopyIcon, EditIcon, PowerIcon, TrashIcon } from "../../../layout/icons";

export default function ActionMenu({ link, onCopy, onEdit, onToggleEnabled, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isDisabled = link.status === "disabled";

  return (
    <div className="action-menu" ref={ref}>
      <button
        type="button"
        className="action-menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${link.fileName}`}
      >
        <MoreIcon width={16} height={16} />
      </button>
      {open && (
        <div className="action-menu__dropdown" role="menu">
          <button type="button" role="menuitem" onClick={() => { onCopy(link); setOpen(false); }}>
            <CopyIcon width={14} height={14} /> Copy link
          </button>
          <button type="button" role="menuitem" onClick={() => { onEdit(link); setOpen(false); }}>
            <EditIcon width={14} height={14} /> Edit
          </button>
          <button type="button" role="menuitem" onClick={() => { onToggleEnabled(link); setOpen(false); }}>
            <PowerIcon width={14} height={14} /> {isDisabled ? "Enable" : "Disable"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="action-menu__danger"
            onClick={() => { onDelete(link); setOpen(false); }}
          >
            <TrashIcon width={14} height={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
