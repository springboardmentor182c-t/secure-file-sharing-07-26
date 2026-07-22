import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiShield, FiGrid, FiFolder, FiShare2, FiLock, FiActivity,
  FiBell, FiBarChart2, FiUsers, FiUser, FiMoon, FiSun, FiLogOut, FiChevronLeft,
} from 'react-icons/fi';

const NAV = [
  { to: '/dashboard',     icon: <FiGrid />,      label: 'Dashboard' },
  { to: '/files',         icon: <FiFolder />,    label: 'My Files' },
  { to: '/sharing',       icon: <FiShare2 />,    label: 'Secure Sharing' },
  { to: '/encryption',    icon: <FiLock />,      label: 'Encryption' },
  { to: '/activity',      icon: <FiActivity />,  label: 'Activity Logs' },
  { to: '/notifications', icon: <FiBell />,      label: 'Notifications', badge: true },
  { to: '/analytics',     icon: <FiBarChart2 />, label: 'Analytics' },
  { to: '/admin',         icon: <FiUsers />,     label: 'Admin Panel', adminOnly: true },
  { to: '/settings',      icon: <FiUser />,      label: 'Profile & Settings' },
];

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const badgeValue = unreadCount > 0 ? unreadCount : 4;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-logo">
        <div className="logo-mark"><FiShield /></div>
        <span className="logo-name">SecureShare</span>
        <button className="sidebar-collapse-btn" title="Collapse">
          <FiChevronLeft />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{badgeValue}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <button className="nav-link" onClick={() => setDark(d => !d)}>
          <span className="nav-icon">{dark ? <FiMoon /> : <FiSun />}</span>
          <span className="nav-label">{dark ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button className="nav-link nav-link-danger" onClick={handleLogout}>
          <span className="nav-icon"><FiLogOut /></span>
          <span className="nav-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
