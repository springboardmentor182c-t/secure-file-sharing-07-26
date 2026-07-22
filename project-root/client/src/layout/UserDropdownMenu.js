// client/src/layout/UserDropdownMenu.js
/**
 * Premium user dropdown — with:
 * - Real-time storage from DB
 * - Auto-refresh on file upload/delete events
 * - Storage warning at 80%+ capacity
 * - Storage breakdown by file type
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  KeyRound,
  ShieldCheck,
  LogOut,
  HardDrive,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Archive,
  File as FileIcon,
} from "lucide-react";
import { authAPI } from "../utils/api";
import { events, EVENTS } from "../utils/events";
import "./UserDropdownMenu.css";

// Category icon mapping
const CATEGORY_ICONS = {
  Documents: FileText,
  Media: ImageIcon,
  Archives: Archive,
  Other: FileIcon,
};

export default function UserDropdownMenu({
  open,
  onClose,
  triggerRef,
  user,
  onLogout,
}) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [freshUser, setFreshUser] = useState(user);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ── Fetch fresh user + storage breakdown ─────────────────────────── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, breakdownRes] = await Promise.all([
        authAPI.me(),
        authAPI.storageBreakdown(),
      ]);
      setFreshUser(userRes.data);
      setBreakdown(breakdownRes.data);
    } catch (err) {
      console.error("Failed to fetch storage data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch on open ──────────────────────────────────────────────── */
  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  /* ── Listen for storage change events (auto-refresh) ──────────────── */
  useEffect(() => {
    const unsubscribe = events.on(EVENTS.STORAGE_CHANGED, () => {
      // Refresh if dropdown is open, otherwise mark for next open
      if (open) fetchData();
      else setFreshUser(null); // Force refetch next time
    });
    return unsubscribe;
  }, [open, fetchData]);

  /* ── Position dropdown ──────────────────────────────────────────── */
  useEffect(() => {
    if (!open || !triggerRef?.current) return;
    const updatePos = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.top, left: rect.left, width: rect.width });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, triggerRef]);

  /* ── Close on outside click ─────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, triggerRef]);

  /* ── Close on Escape ────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const displayUser = freshUser || user;

  const initials =
    displayUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "TS";

  /* ── Storage calculation ──────────────────────────────────────────── */
  const storageUsed = displayUser?.storage_used || 0;
  const storageQuota = displayUser?.storage_quota || 5368709120;
  const storagePct = Math.min(
    Math.round((storageUsed / storageQuota) * 100),
    100
  );

  /* ── Storage status (color + warning) ────────────────────────────── */
  const getStorageStatus = () => {
    if (storagePct >= 95) {
      return { level: "critical", color: "#ef4444", label: "Critical" };
    }
    if (storagePct >= 80) {
      return { level: "warning", color: "#f59e0b", label: "Warning" };
    }
    if (storagePct >= 60) {
      return { level: "caution", color: "#eab308", label: "Caution" };
    }
    return { level: "healthy", color: "#10b981", label: "Healthy" };
  };
  const storageStatus = getStorageStatus();
  const showWarning = storagePct >= 80;

  /* ── Smart size formatting ────────────────────────────────────────── */
  const formatSize = (bytes) => {
    const gb = bytes / (1024 ** 3);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 ** 2);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    if (kb >= 1) return `${kb.toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const usedDisplay = formatSize(storageUsed);
  const totalDisplay = formatSize(storageQuota);

  /* ── Role display ────────────────────────────────────────────────── */
  const roleLabel = {
    admin: "Admin",
    member: "Member",
    guest: "Guest",
  }[displayUser?.role] || "Member";

  const rolePillClass = {
    admin: "user-dropdown-role--admin",
    member: "user-dropdown-role--member",
    guest: "user-dropdown-role--guest",
  }[displayUser?.role] || "user-dropdown-role--member";

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { icon: User, label: "View Profile", onClick: () => handleNavigate("/settings") },
    { icon: KeyRound, label: "Change Password", onClick: () => handleNavigate("/settings") },
    { icon: ShieldCheck, label: "Security & MFA", onClick: () => handleNavigate("/settings") },
  ];

  if (!open) return null;

  // Filter categories with data
  const activeCategories = breakdown?.categories?.filter((c) => c.size_bytes > 0) || [];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          className="user-dropdown"
          role="menu"
          style={{
            position: "fixed",
            left: pos.left,
            bottom: window.innerHeight - pos.top + 8,
            width: pos.width,
            minWidth: 260,
          }}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Profile header */}
          <div className="user-dropdown-header">
            <div
              className="user-dropdown-avatar"
              style={{
                background:
                  displayUser?.avatar_color ||
                  "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
            >
              {initials}
            </div>
            <div className="user-dropdown-identity">
              <div className="user-dropdown-name-row">
                <span className="user-dropdown-name">
                  {displayUser?.name || "Guest User"}
                </span>
                <span className={`user-dropdown-role ${rolePillClass}`}>
                  {roleLabel}
                </span>
              </div>
              <span className="user-dropdown-email">
                {displayUser?.email || "guest@user.com"}
              </span>
            </div>
          </div>

          {/* Storage section */}
          <div className="user-dropdown-storage">
            <div className="user-dropdown-storage-header">
              <div className="user-dropdown-storage-label">
                <HardDrive size={12} />
                <span>Storage</span>
                {loading && (
                  <span className="user-dropdown-storage-loading">•</span>
                )}
              </div>
              <span className="user-dropdown-storage-value">
                {usedDisplay} / {totalDisplay}
              </span>
            </div>

            {/* Progress bar with color-coded status */}
            <div className="user-dropdown-storage-track">
              <motion.div
                className="user-dropdown-storage-fill"
                initial={{ width: 0 }}
                animate={{ width: `${storagePct}%` }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
                style={{
                  background:
                    storagePct >= 95
                      ? "linear-gradient(90deg, #ef4444, #dc2626)"
                      : storagePct >= 80
                      ? "linear-gradient(90deg, #f59e0b, #d97706)"
                      : storagePct >= 60
                      ? "linear-gradient(90deg, #eab308, #ca8a04)"
                      : "linear-gradient(90deg, #3b82f6, #6366f1)",
                }}
              />
            </div>

            <div className="user-dropdown-storage-footer">
              <span
                className="user-dropdown-storage-pct"
                style={{ color: storageStatus.color }}
              >
                {storagePct}% used
              </span>
              <span
                className="user-dropdown-storage-status"
                style={{ color: storageStatus.color }}
              >
                {storageStatus.label}
              </span>
            </div>

            {/* Warning banner at 80%+ */}
            {showWarning && (
              <motion.div
                className={`user-dropdown-warning user-dropdown-warning--${storageStatus.level}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <AlertTriangle size={12} />
                <span>
                  {storagePct >= 95
                    ? "Storage almost full!"
                    : `You're at ${storagePct}% capacity`}
                </span>
              </motion.div>
            )}

            {/* Storage breakdown by file type */}
            {activeCategories.length > 0 && (
              <motion.div
                className="user-dropdown-breakdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div className="user-dropdown-breakdown-label">Breakdown</div>

                {/* Segmented bar */}
                <div className="user-dropdown-breakdown-bar">
                  {activeCategories.map((cat, i) => (
                    <motion.div
                      key={cat.name}
                      className="user-dropdown-breakdown-segment"
                      style={{
                        width: `${cat.pct}%`,
                        background: cat.color,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + i * 0.05,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      title={`${cat.name}: ${cat.pct}%`}
                    />
                  ))}
                </div>

                {/* Category list */}
                <div className="user-dropdown-breakdown-list">
                  {activeCategories.map((cat, i) => {
                    const Icon = CATEGORY_ICONS[cat.name] || FileIcon;
                    return (
                      <motion.div
                        key={cat.name}
                        className="user-dropdown-breakdown-item"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.25 + i * 0.04 }}
                      >
                        <div className="user-dropdown-breakdown-info">
                          <span
                            className="user-dropdown-breakdown-dot"
                            style={{ background: cat.color }}
                          />
                          <Icon size={11} className="user-dropdown-breakdown-icon" />
                          <span className="user-dropdown-breakdown-name">
                            {cat.name}
                          </span>
                          <span className="user-dropdown-breakdown-count">
                            ({cat.count})
                          </span>
                        </div>
                        <span className="user-dropdown-breakdown-size">
                          {formatSize(cat.size_bytes)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Menu items */}
          <div className="user-dropdown-menu">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  className="user-dropdown-item"
                  onClick={item.onClick}
                  role="menuitem"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.04 * i + 0.15,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={15} className="user-dropdown-item-icon" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="user-dropdown-divider" />

          {/* Sign out */}
          <motion.button
            className="user-dropdown-item user-dropdown-item--danger"
            onClick={() => {
              onClose();
              onLogout();
            }}
            role="menuitem"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.2,
              delay: 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={15} className="user-dropdown-item-icon" />
            <span>Sign out</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}