import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ unreadCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatar = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TS';

  return (
    <header className="navbar">
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="navbar-search">
        <span className="navbar-search-icon">🔍</span>
        <input type="text" placeholder="Search files, users, links…" />
      </div>

      <div className="navbar-actions">
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/files')}>
          ⬆️ Upload
        </button>
        <button
          className="icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>
        <button className="icon-btn" title="Security Status">🛡️</button>
        <div
          className="avatar av-md"
          style={{
            background: user?.avatar_color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            cursor: 'pointer',
          }}
          title={user?.name}
        >
          {avatar}
        </div>
      </div>
    </header>
  );
}
