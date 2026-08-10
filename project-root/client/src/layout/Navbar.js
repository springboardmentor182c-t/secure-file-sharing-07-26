import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Moon, Sun, CheckCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  RiSearch2Line,
  RiFileTextLine,
  RiFolderOpenLine,
  RiShareForwardLine,
  RiNotification3Line,
  RiImageLine,
  RiFileZipLine,
  RiCodeBoxLine,
  RiVideoLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import { searchAPI, notificationsAPI } from "../utils/api";
import "./Navbar.css";

const FILE_ICON_MAP = {
  image: ["png", "jpg", "jpeg", "gif", "svg", "webp"],
  video: ["mp4", "avi", "mov", "mkv"],
  archive: ["zip", "rar", "7z"],
  code: ["js", "jsx", "ts", "tsx", "java", "py", "cpp", "css", "html"],
};

function getSearchFileIcon(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  if (FILE_ICON_MAP.image.includes(ext))
    return <RiImageLine className="search-icon" />;
  if (FILE_ICON_MAP.video.includes(ext))
    return <RiVideoLine className="search-icon" />;
  if (FILE_ICON_MAP.archive.includes(ext))
    return <RiFileZipLine className="search-icon" />;
  if (FILE_ICON_MAP.code.includes(ext))
    return <RiCodeBoxLine className="search-icon" />;
  return <RiFileTextLine className="search-icon" />;
}

function getNotificationIcon(notification) {
  const text = `${notification.title} ${notification.message}`.toLowerCase();
  if (text.includes("share"))
    return <RiShareForwardLine className="notification-type-icon" />;
  if (text.includes("folder"))
    return <RiFolderOpenLine className="notification-type-icon" />;
  if (text.includes("security"))
    return <RiShieldCheckLine className="notification-type-icon" />;
  if (text.includes("file"))
    return <RiFileTextLine className="notification-type-icon" />;
  return <RiNotification3Line className="notification-type-icon" />;
}

/* ──────────────────────────────────────────────────────────────────────────
   NAVBAR
   ────────────────────────────────────────────────────────────────────────── */
export default function Navbar({ unreadCount = 0, connectionStatus }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Keyboard navigation for search results
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  /* ── Search (debounced) ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchAPI.search(query);
        setResults(res.data);
        setActiveIndex(-1);
      } catch (err) {
        console.error(err);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  /* ── Click outside handling ─────────────────────────────────────────── */
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults(null);
        setActiveIndex(-1);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Global keyboard shortcuts (Ctrl+K / Esc) ───────────────────────── */
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setResults(null);
        setShowNotifications(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ── Scroll shadow detection ────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Load notifications when opened ─────────────────────────────────── */
  useEffect(() => {
    if (!showNotifications) return;
    const load = async () => {
      try {
        const res = await notificationsAPI.list();
        setNotifications(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [showNotifications]);

  /* ── Flatten search results for keyboard navigation ─────────────────── */
  const flatResults = useMemo(() => {
    if (!results) return [];
    const list = [];
    results.files?.forEach((f) =>
      list.push({ type: "file", data: f, id: `file-${f.id}` })
    );
    results.folders?.forEach((f) =>
      list.push({ type: "folder", data: f, id: `folder-${f.id}` })
    );
    results.shares?.forEach((s) =>
      list.push({ type: "share", data: s, id: `share-${s.id}` })
    );
    results.notifications?.forEach((n) =>
      list.push({ type: "notification", data: n, id: `notif-${n.id}` })
    );
    return list;
  }, [results]);

  /* ── Search input keyboard navigation ──────────────────────────────── */
  const handleSearchKeyDown = (e) => {
    if (!results || flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? flatResults.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = flatResults[activeIndex];
      handleResultClick(item.type);
    }
  };

  /* ── Scroll active item into view ──────────────────────────────────── */
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = document.querySelector(`[data-result-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const handleResultClick = (type) => {
    setQuery("");
    setResults(null);
    setActiveIndex(-1);
    const routes = {
      file: "/files",
      folder: "/files",
      share: "/sharing",
      notification: "/notifications",
    };
    navigate(routes[type] || "/dashboard");
  };

  /* ── Mark all notifications as read ────────────────────────────────── */
  const handleMarkAllRead = async () => {
    if (markingAllRead || notifications.length === 0) return;
    setMarkingAllRead(true);
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const hasNoResults =
    results &&
    !results.files?.length &&
    !results.folders?.length &&
    !results.shares?.length &&
    !results.notifications?.length;

  /* ── Render helpers ────────────────────────────────────────────────── */
  const renderSearchItem = (item, globalIndex) => {
    const isActive = activeIndex === globalIndex;

    const iconMap = {
      file: () => getSearchFileIcon(item.data.original_name),
      folder: () => <RiFolderOpenLine className="search-icon" />,
      share: () => <RiShareForwardLine className="search-icon" />,
      notification: () => <RiNotification3Line className="search-icon" />,
    };

    const labelMap = {
      file: item.data.original_name,
      folder: item.data.name,
      share: `Share #${item.data.id}`,
      notification: item.data.title,
    };

    return (
      <motion.div
        key={item.id}
        data-result-index={globalIndex}
        className={`search-item ${isActive ? "search-item--active" : ""}`}
        onClick={() => handleResultClick(item.type)}
        onMouseEnter={() => setActiveIndex(globalIndex)}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: globalIndex * 0.02, duration: 0.2 }}
      >
        {iconMap[item.type]()}
        <span>{labelMap[item.type]}</span>
      </motion.div>
    );
  };

  let currentIndex = 0;
  const renderSection = (title, items, type) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="search-section">
        <div className="search-title">{title}</div>
        {items.map((data) => {
          const item = { type, data, id: `${type}-${data.id}` };
          const el = renderSearchItem(item, currentIndex);
          currentIndex++;
          return el;
        })}
      </div>
    );
  };

  return (
    <header className={`navbar-modern ${scrolled ? "scrolled" : ""}`}>
      {/* ── Search ────────────────────────────────── */}
      <div className="navbar-search" ref={searchRef}>
        <RiSearch2Line className="search-icon" />

        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search files, people, activity..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResults(null);
            setActiveIndex(-1);
          }}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search"
        />

        <AnimatePresence>
          {loading && (
            <motion.div
              className="search-dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="search-loading">
                <div className="search-spinner" />
                <span>Searching...</span>
              </div>
            </motion.div>
          )}

          {!loading && results && (
            <motion.div
              className="search-dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            >
              {(() => {
                currentIndex = 0;
                return (
                  <>
                    {renderSection("Files", results.files, "file")}
                    {renderSection("Folders", results.folders, "folder")}
                    {renderSection("Shares", results.shares, "share")}
                    {renderSection(
                      "Notifications",
                      results.notifications,
                      "notification"
                    )}
                  </>
                );
              })()}

              {hasNoResults && (
                <motion.div
                  className="search-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <RiSearch2Line size={28} className="search-empty-icon" />
                  <p className="search-empty-title">No results found</p>
                  <p className="search-empty-hint">Try different keywords</p>
                </motion.div>
              )}

              {flatResults.length > 0 && (
                <div className="search-hints">
                  <span>
                    <kbd>↑</kbd>
                    <kbd>↓</kbd> Navigate
                  </span>
                  <span>
                    <kbd>↵</kbd> Select
                  </span>
                  <span>
                    <kbd>Esc</kbd> Close
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <kbd className="search-shortcut">Ctrl+K</kbd>
      </div>

      {/* ── Actions ────────────────────────────────── */}
      <div className="navbar-actions" ref={notificationRef}>
        {/* Connection status indicator */}
        {connectionStatus}
        {/* Theme toggle */}
        <motion.button
          className="nav-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={{ display: "flex" }}
              >
                <Sun size={18} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={{ display: "flex" }}
              >
                <Moon size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <motion.button
          className={`nav-icon-btn ${showNotifications ? "active" : ""}`}
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""
            }`}
          title="Notifications"
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <motion.span
              className="notif-dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* Notification dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              className="notification-dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="notification-header">
                <div className="notification-header-left">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notification-count">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <motion.button
                    className="notification-mark-all"
                    onClick={handleMarkAllRead}
                    disabled={markingAllRead}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </motion.button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <Bell size={28} className="notification-empty-icon" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification, i) => (
                  <motion.div
                    key={notification.id}
                    className="notification-item"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/notifications");
                    }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.04 * i,
                      duration: 0.28,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              <motion.button
                className="notification-view-all"
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/notifications");
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                View All
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}