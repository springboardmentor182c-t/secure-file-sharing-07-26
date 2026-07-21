import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell } from 'react-icons/fi';

export default function Navbar({ unreadCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatar = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="navbar">
      <div className="navbar-search">
        <span className="navbar-search-icon"><FiSearch /></span>
        <input type="text" placeholder="Search files, users, logs…" />
      </div>

      <div className="navbar-actions">
        <button
          className="icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <FiBell />
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>

        <div className="navbar-user" onClick={() => navigate('/settings')} title={user?.name}>
          <div
            className="avatar av-md"
            style={{ background: user?.avatar_color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
          >
            {avatar}
          </div>
          <div className="navbar-user-meta">
            <div className="navbar-user-name">{user?.name || 'User'}</div>
            <div className="navbar-user-role">{user?.role || 'member'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
