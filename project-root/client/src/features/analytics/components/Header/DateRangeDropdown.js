// client/src/features/analytics/components/Header/DateRangeDropdown.js
/**
 * Custom dropdown with rounded corners — adapts to light/dark mode.
 * Renders menu in a portal so it can overflow parent containers.
 */

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function DateRangeDropdown({
  options   = [],
  value     = "",
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const menuRef    = useRef(null);

  // Calculate menu position based on trigger button
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top:   rect.bottom + window.scrollY + 6,
      left:  rect.left + window.scrollX,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open]);

  // Close on outside click (both trigger and portal)
  useEffect(() => {
    function handleClick(e) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const selected = options.find((o) => o.value === value);
  const label    = selected?.label || "Select...";

  const handleSelect = (val) => {
    if (onChange) onChange(val);
    setOpen(false);
  };

  return (
    <div className="an-dropdown">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={`an-dropdown-trigger ${open ? "an-dropdown-trigger--open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="an-dropdown-label">{label}</span>
        <motion.span
          className="an-dropdown-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* Menu — rendered via portal so it escapes overflow:hidden parents */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              className="an-dropdown-menu-portal"
              role="listbox"
              style={{
                position: "absolute",
                top:      menuPos.top,
                left:     menuPos.left,
                minWidth: Math.max(menuPos.width, 160),
              }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y:  0, scale: 1    }}
              exit={{    opacity: 0, y: -6, scale: 0.97  }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`an-dropdown-item ${isActive ? "an-dropdown-item--active" : ""}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <span className="an-dropdown-item-label">{opt.label}</span>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="an-dropdown-check"
                      >
                        <Check size={13} />
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}