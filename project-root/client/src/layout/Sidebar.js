import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiShield, FiGrid, FiShare2, FiActivity,
  FiBell, FiBarChart2, FiUsers, FiSettings, FiMoon, FiSun, FiLogOut,
} from 'react-icons/fi';

const NAV = [
  { to: '/dashboard',     icon: <FiGrid />,      label: 'Dashboard' },
  { to: '/sharing',       icon: <FiShare2 />,    label: 'Secure Sharing' },
  { to: '/activity',      icon: <FiActivity />,  label: 'Activity Logs', adminOnly: true },
  { to: '/notifications', icon: <FiBell />,      label: 'Notifications', badge: true },
  { to: '/analytics',     icon: <FiBarChart2 />, label: 'Analytics' },
  { to: '/admin',         icon: <FiUsers />,     label: 'Admin Panel', adminOnly: true },
  { to: '/settings',      icon: <FiSettings />,  label: 'Profile & Settings' },
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

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-logo">
        <div className="logo-mark"><FiShield /></div>
        <span className="logo-name">SecureShare</span>
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
            <span>{item.label}</span>
            {item.badge && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <button className="nav-link" onClick={() => setDark(d => !d)}>
          <span className="nav-icon">{dark ? <FiMoon /> : <FiSun />}</span>
          <span>{dark ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button className="nav-link nav-link-danger" onClick={handleLogout}>
          <span className="nav-icon"><FiLogOut /></span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
