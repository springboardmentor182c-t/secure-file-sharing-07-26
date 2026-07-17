import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

import {
  ShieldCheck,
  LayoutDashboard,
  FolderOpen,
  Share2,
  Activity,
  Bell,
  BarChart3,
  Shield,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
  },
  {
    to: "/files",
    label: "My Files",
    icon: <FolderOpen size={16} />,
  },
  {
    to: "/sharing",
    label: "Sharing",
    icon: <Share2 size={16} />,
  },
  {
    to: "/activity",
    label: "Activity",
    icon: <Activity size={16} />,
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: <Bell size={16} />,
    badge: true,
  },
  {
  to: "/analytics",
  label: "Analytics",
  icon: <BarChart3 size={16} />,
},
{
  to: "/admin",
  label: "Admin",
  icon: <Shield size={16} />,
},
{
  to: "/settings",
  label: "Settings",
  icon: <Settings size={16} />,
},
];

export default function Sidebar({
  unreadCount = 0,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {

  const { user, logout } = useAuth();

  const navigate = useNavigate();



  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "TS";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Toggle */}

      <button
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar-modern
          ${sidebarOpen ? "sidebar-open" : ""}
          ${sidebarCollapsed ? "sidebar-collapsed" : ""}
        `}
      >
        {/* Mobile Close */}
<div className="sidebar-header-mobile">
  <button
    className="sidebar-close-btn"
    onClick={() => setSidebarOpen(false)}
  >
    <X size={20} />
  </button>
</div>

{/* Logo */}

<div className="sidebar-logo">

  <button
    className="sidebar-brand"
    onClick={() => navigate("/dashboard")}
  >

    <div className="sidebar-logo-icon">
      <ShieldCheck size={18} />
    </div>

    {!sidebarCollapsed && (
      <>
        <div className="sidebar-logo-text">
          <span className="brand-title">
            TrustShare
          </span>

          <span className="brand-subtitle">
            Secure Sharing
          </span>
        </div>

        <span className="sidebar-beta">
          Beta
        </span>
      </>
    )}

  </button>

  <button
    className="sidebar-collapse-btn"
    onClick={() =>
      setSidebarCollapsed(!sidebarCollapsed)
    }
  >
    {sidebarCollapsed ? "»" : "«"}
  </button>

</div>

{/* Navigation */}

<nav className="sidebar-nav">

  {NAV_ITEMS.map((item) => (

    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`
      }
    >

      <span className="sidebar-link-icon">
        {item.icon}
      </span>

      {!sidebarCollapsed && (
        <span className="sidebar-link-text">
          {item.label}
        </span>
      )}

      {!sidebarCollapsed &&
        item.badge &&
        unreadCount > 0 && (

        <span className="sidebar-link-badge">
          {unreadCount}
        </span>

      )}

    </NavLink>

  ))}

</nav>
{/* Bottom User Section */}

<div className="sidebar-footer">

  <button
    className="sidebar-user"
    onClick={() => navigate("/settings")}
  >

    <div
      className="sidebar-avatar"
      style={{
        background:
          user?.avatar_color ||
          "linear-gradient(135deg,#2563eb,#4f46e5)"
      }}
    >
      {initials}
    </div>

    {!sidebarCollapsed && (

      <div className="sidebar-user-info">

        <span className="sidebar-user-name">
          {user?.name || "Badal"}
        </span>

        <span className="sidebar-user-email">
          {user?.email || "guest@user.com"}
        </span>

      </div>

      )}


    {!sidebarCollapsed && (

      <ChevronDown
        size={16}
        className="sidebar-chevron"
      />

      )}

  </button>

  <button
    className="sidebar-logout"
    onClick={handleLogout}
  >
    <LogOut size={16} />

   {!sidebarCollapsed && (
      <span>
        Sign Out
      </span>
    )}

  </button>

</div>

</aside>

</>
);
}