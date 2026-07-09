import React, { useState } from "react";
import "./Sidebar.css";
import {
  FolderIcon, ClockIcon, StarIcon, TrashIcon, LinkIcon,
  BarChartIcon, AuditIcon, ShieldIcon, UsersIcon, BellIcon, SettingsIcon,
  ShieldIcon as LogoShield, LogoutIcon, ChevronLeftIcon,
} from "./icons";

const NAV_SECTIONS = [
  {
    label: "Personal",
    items: [
      { id: "my-files", label: "My Files", icon: FolderIcon },
      { id: "shared-with-me", label: "Shared with Me", icon: UsersIcon },
      { id: "recent", label: "Recent", icon: ClockIcon },
      { id: "starred", label: "Starred", icon: StarIcon },
      { id: "trash", label: "Trash", icon: TrashIcon },
    ],
  },
  {
    label: "Sharing",
    items: [{ id: "shared-links", label: "Shared Links", icon: LinkIcon }],
  },
  {
    label: "Management",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChartIcon },
      { id: "audit-log", label: "Audit Log", icon: AuditIcon },
      { id: "security", label: "Security", icon: ShieldIcon, badge: 3 },
      { id: "admin", label: "Admin", icon: UsersIcon },
      { id: "notifications", label: "Notifications", icon: BellIcon, badge: 3 },
    ],
  },
  {
    label: "Account",
    items: [{ id: "settings", label: "Settings", icon: SettingsIcon }],
  },
];

/**
 * Reusable app Sidebar.
 *
 * Props:
 *  - activeItem: string id of the currently active nav item (default "shared-links")
 *  - onNavigate: (itemId: string) => void — called when a nav item is clicked.
 *      Wire this to react-router's `navigate()` once routing is added; for now
 *      it simply reports the intended destination so each teammate's page can
 *      decide how to react.
 *  - user: { name, initials, authMethod, mfaOn }
 *  - storage: { usedGB, totalGB }
 *  - onLogout: () => void
 */
export default function Sidebar({
  activeItem = "shared-links",
  onNavigate = () => {},
  user = { name: "Alex Chen", initials: "AC", authMethod: "JWT", mfaOn: true },
  storage = { usedGB: 412, totalGB: 500 },
  onLogout = () => {},
}) {
  const [collapsed, setCollapsed] = useState(false);
  const storagePct = Math.min(100, Math.round((storage.usedGB / storage.totalGB) * 100));

  const handleKeyNav = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate(id);
    }
  };

  return (
    <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`} aria-label="Primary">
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon"><LogoShield /></span>
        {!collapsed && <span className="sidebar__brand-name">TrustShare</span>}
        <button
          type="button"
          className="sidebar__collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeftIcon style={{ transform: collapsed ? "rotate(180deg)" : "none" }} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div className="sidebar__section" key={section.label}>
            {!collapsed && <div className="sidebar__section-label">{section.label}</div>}
            <ul className="sidebar__list">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeItem;
                return (
                  <li key={item.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      className={`sidebar__item${isActive ? " sidebar__item--active" : ""}`}
                      onClick={() => onNavigate(item.id)}
                      onKeyDown={(e) => handleKeyNav(e, item.id)}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="sidebar__item-icon" />
                      {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
                      {!collapsed && item.badge ? (
                        <span className="sidebar__badge">{item.badge}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__storage">
            <div className="sidebar__storage-label">
              <span>Storage</span>
              <span>{storage.usedGB} / {storage.totalGB} GB</span>
            </div>
            <div className="sidebar__storage-bar">
              <div className="sidebar__storage-fill" style={{ width: `${storagePct}%` }} />
            </div>
          </div>
        )}

        <div className="sidebar__profile">
          <div className="sidebar__avatar" aria-hidden="true">{user.initials}</div>
          {!collapsed && (
            <div className="sidebar__profile-meta">
              <div className="sidebar__profile-name">{user.name}</div>
              <div className="sidebar__profile-auth">
                <ShieldIcon className="sidebar__profile-auth-icon" />
                {user.authMethod} · MFA {user.mfaOn ? "on" : "off"}
              </div>
            </div>
          )}
          <button
            type="button"
            className="sidebar__logout-btn"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
