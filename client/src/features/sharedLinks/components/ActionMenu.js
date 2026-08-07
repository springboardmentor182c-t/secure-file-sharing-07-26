import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { MoreIcon, CopyIcon, EditIcon, PowerIcon, TrashIcon } from "../../../layout/icons";

export default function ActionMenu({ link, onCopy, onEdit, onToggleEnabled, onDelete }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 180;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top;
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 6;
      } else {
        top = rect.bottom + 6;
      }

      const left = Math.max(10, rect.right - 160);
      setCoords({ top, left });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    function handleScrollOrResize() {
      setOpen(false);
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

  const isDisabled = link.status === "disabled";

  return (
    <div className="action-menu">
      <button
        ref={triggerRef}
        type="button"
        className="action-menu__trigger"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${link.fileName}`}
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
        </div>,
        document.body
      )}
    </div>
  );
}
