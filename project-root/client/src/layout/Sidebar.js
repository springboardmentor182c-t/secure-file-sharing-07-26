import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard',      icon: '📊', label: 'Dashboard' },
  { to: '/files',          icon: '📁', label: 'File Manager' },
  { to: '/sharing',        icon: '🔗', label: 'Sharing Center' },
  { to: '/analytics',      icon: '📈', label: 'Analytics' },
  { to: '/notifications',  icon: '🔔', label: 'Notifications', badge: true },
  { to: '/admin',          icon: '⚙️', label: 'Admin Panel', adminOnly: true },
];

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const storageUsedGB = user ? (user.storage_used / 1e9).toFixed(1) : '0';
  const storageQuotaGB = user ? (user.storage_quota / 1e9).toFixed(0) : '5';
  const storagePct = user ? Math.min((user.storage_used / user.storage_quota) * 100, 100) : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatar = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TS';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">🔐</div>
        <span className="logo-name">TrustShare</span>
        <span className="badge badge-emerald" style={{ marginLeft: 'auto', fontSize: '.6rem', padding: '2px 7px' }}>
          AES-256
        </span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>Services</div>
        {[
          { icon: '✉️', label: 'Email (SendGrid)' },
          { icon: '🛡️', label: 'SIEM Monitor' },
          { icon: '🤖', label: 'Anomaly Detection' },
        ].map(s => (
          <div key={s.label} className="nav-link" style={{ cursor: 'default', opacity: .6 }}>
            <span className="nav-icon">{s.icon}</span>
            <span>{s.label}</span>
            <span className="badge badge-emerald" style={{ marginLeft: 'auto', fontSize: '.6rem' }}>Live</span>
          </div>
        ))}
      </nav>

      {/* Storage */}
      <div className="sidebar-storage">
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '.8125rem', fontWeight: 600 }}>Storage</span>
          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{storageUsedGB} / {storageQuotaGB} GB</span>
        </div>
        <div className="storage-bar-wrap">
          <div className="storage-bar-fill" style={{ width: `${storagePct}%` }} />
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user" onClick={() => setShowMenu(v => !v)}>
        <div
          className="avatar av-md"
          style={{ background: user?.avatar_color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
        >
          {avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name truncate">{user?.name || 'User'}</div>
          <div className="user-role">{user?.role} · {user?.plan}</div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>⋯</span>

        {showMenu && (
          <div
            style={{
              position: 'absolute', bottom: '100%', left: 12, right: 12,
              background: '#0d1b36', border: '1px solid var(--border-medium)',
              borderRadius: 10, padding: 6, zIndex: 300, boxShadow: 'var(--shadow-lg)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { icon: '👤', label: 'Profile Settings' },
              { icon: '🔐', label: 'Security & MFA' },
              { icon: '💳', label: 'Billing & Plan' },
            ].map(item => (
              <div
                key={item.label}
                className="nav-link"
                style={{ cursor: 'pointer', borderRadius: 8 }}
              >
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            <div
              className="nav-link"
              style={{ cursor: 'pointer', color: 'var(--rose-400)', borderRadius: 8 }}
              onClick={handleLogout}
            >
              <span>🚪</span> Sign Out
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
