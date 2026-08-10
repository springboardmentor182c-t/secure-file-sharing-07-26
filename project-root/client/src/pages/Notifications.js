import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Trash2, Shield, Share2, AlertCircle,
  RefreshCw, Search, Check,
} from 'lucide-react';
import { notificationsAPI } from '../utils/api';
import { useRealtime } from '../context/RealtimeContext';
import './Notifications.css';

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getIcon(type = '', title = '') {
  const t = (type + ' ' + title).toLowerCase();
  if (t.includes('share') || t.includes('access') || t.includes('link')) {
    return {
      Icon: Share2,
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.3)',
      color: '#38bdf8',
    };
  }
  if (t.includes('security') || t.includes('mfa') || t.includes('password') || t.includes('login')) {
    return {
      Icon: Shield,
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      color: '#34d399',
    };
  }
  if (t.includes('warn') || t.includes('quota') || t.includes('failed') || t.includes('alert')) {
    return {
      Icon: AlertCircle,
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      color: '#fbbf24',
    };
  }
  return {
    Icon: Bell,
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  };
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'sharing' | 'security'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const realtime = useRealtime();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.list();
      const items = Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
      setNotifications(items);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time synchronization
  useEffect(() => {
    if (!realtime?.subscribe) return;

    const unsubNew = realtime.subscribe('notification_new', (notif) => {
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    });

    const unsubUpd = realtime.subscribe('notification_updated', (data) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === data.id ? { ...n, read: data.read } : n))
      );
    });

    const unsubDel = realtime.subscribe('notification_deleted', (data) => {
      setNotifications((prev) => prev.filter((n) => n.id !== data.id));
    });

    const unsubAll = realtime.subscribe('notification_all_read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });

    return () => {
      unsubNew();
      unsubUpd();
      unsubDel();
      unsubAll();
    };
  }, [realtime]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter items
  const filtered = notifications.filter((n) => {
    const text = `${n.title} ${n.message}`.toLowerCase();
    if (searchQuery && !text.includes(searchQuery.toLowerCase())) return false;

    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'sharing') return text.includes('share') || text.includes('access') || text.includes('link') || text.includes('email');
    if (activeTab === 'security') return text.includes('security') || text.includes('mfa') || text.includes('password') || text.includes('login') || text.includes('encrypt');
    return true;
  });

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-header">
        <div className="notif-title-wrap">
          <h1>Notifications Center</h1>
          <p className="notif-subtitle">Live real-time alerts for sharing events, security, and file activities</p>
        </div>

        <div className="notif-actions">
          <button
            type="button"
            className="notif-btn-action"
            onClick={fetchNotifications}
            title="Refresh feed"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="notif-btn-action"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="notif-filters-bar">
        <div className="notif-tabs">
          <button
            type="button"
            className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>All</span>
            <span className="notif-pill-count">{notifications.length}</span>
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            <span>Unread</span>
            {unreadCount > 0 && <span className="notif-pill-count">{unreadCount}</span>}
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'sharing' ? 'active' : ''}`}
            onClick={() => setActiveTab('sharing')}
          >
            <Share2 size={14} />
            <span>Sharing & Access</span>
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={14} />
            <span>Security & Auth</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search alerts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-list-card">
        {loading ? (
          <div className="notif-empty">
            <RefreshCw size={28} className="spin" color="#38bdf8" />
            <p>Loading real-time notifications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <Bell size={42} color="#334155" />
            <p>No notifications found in this view.</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const { Icon, bg, border, color } = getIcon(notif.type, notif.title);
            const isShare = (notif.title + ' ' + notif.message).toLowerCase().includes('share');
            const isSec = (notif.title + ' ' + notif.message).toLowerCase().includes('mfa') || (notif.title + ' ' + notif.message).toLowerCase().includes('password');

            return (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
              >
                {!notif.read && <div className="notif-unread-dot" />}
                <div className="notif-icon-circle" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon size={18} color={color} />
                </div>
                <div className="notif-content">
                  <div className="notif-item-header">
                    <span className="notif-item-title">{notif.title}</span>
                    <span className="notif-item-time">{timeAgo(notif.created_at)}</span>
                  </div>
                  <p className="notif-item-msg">{notif.message}</p>
                  
                  <div className="notif-item-actions">
                    {isShare && (
                      <button
                        type="button"
                        className="notif-btn-inline"
                        onClick={(e) => { e.stopPropagation(); navigate('/sharing'); }}
                      >
                        <Share2 size={13} /> View in Sharing History
                      </button>
                    )}
                    {isSec && (
                      <button
                        type="button"
                        className="notif-btn-inline"
                        onClick={(e) => { e.stopPropagation(); navigate('/settings'); }}
                      >
                        <Shield size={13} /> Open Security Settings
                      </button>
                    )}
                    {!notif.read && (
                      <button
                        type="button"
                        className="notif-btn-inline"
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                        style={{ color: '#94a3b8' }}
                      >
                        <Check size={13} /> Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      className="notif-btn-del"
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                      title="Delete alert"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
