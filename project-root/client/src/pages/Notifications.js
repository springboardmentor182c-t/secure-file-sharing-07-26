import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Bell, CheckCheck, Download, Eye, Share2, ShieldCheck, Upload, X } from 'lucide-react';
import { notificationsAPI } from '../utils/api';
import './Notifications.css';

const TYPE_STYLE = {
  share: { bg: 'rgba(59,130,246,.15)', color: 'var(--blue-400)', Icon: Share2 },
  security: { bg: 'rgba(244,63,94,.15)', color: 'var(--rose-400)', Icon: ShieldCheck },
  upload: { bg: 'rgba(16,185,129,.15)', color: 'var(--emerald-400)', Icon: Upload },
  access: { bg: 'rgba(245,158,11,.15)', color: 'var(--amber-400)', Icon: Eye },
  download: { bg: 'rgba(139,92,246,.15)', color: 'var(--purple-400)', Icon: Download },
  summary: { bg: 'rgba(6,182,212,.15)', color: 'var(--cyan-400)', Icon: Activity },
};

const timeAgo = (dateStr) => {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(dateStr)) / 1000));
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationsAPI.list();
      setItems(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Notifications could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = items.filter((notification) => !notification.is_read);
  const categoryFor = (notification) => {
    if (notification.type === 'download') return 'downloads';
    if (notification.type === 'expiration') return 'expirations';
    if (notification.type === 'system' || notification.category === 'activity') return 'system';
    if (notification.category === 'uploads') return 'system';
    return notification.category;
  };
  const filtered = filter === 'all'
    ? items
    : items.filter((notification) => categoryFor(notification) === filter);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setItems((previous) => previous.map((notification) => (
        notification.id === id ? { ...notification, is_read: true } : notification
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'The notification could not be updated.');
    }
  };

  const markAll = async () => {
    setBusy(true);
    setError('');
    try {
      await notificationsAPI.markAllRead();
      setItems((previous) => previous.map((notification) => ({ ...notification, is_read: true })));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Notifications could not be marked as read.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setItems((previous) => previous.filter((notification) => notification.id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'The notification could not be deleted.');
    }
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'shares', label: 'Shares' },
    { value: 'security', label: 'Security' },
    { value: 'downloads', label: 'Downloads' },
    { value: 'expirations', label: 'Expirations' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Notifications</h1>
          <p className="text-muted text-sm mt-1">{unread.length} unread · {items.length} total</p>
        </div>
        {unread.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAll} disabled={busy}>
            <CheckCheck size={16} /> {busy ? 'Updating…' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="notification-filters" role="tablist" aria-label="Notification categories">
        {filters.map(({ value, label }) => {
          const count = value === 'all' ? items.length : items.filter((item) => categoryFor(item) === value).length;
          return (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`btn btn-sm ${filter === value ? 'btn-primary' : 'btn-ghost'}`}
            role="tab"
            aria-selected={filter === value}
          >
            {label} <span className="notification-filter-count">{count}</span>
          </button>
          );
        })}
      </div>

      {error && (
        <div className="card mb-4" role="alert" style={{ padding: 16, borderColor: 'var(--rose-400)' }}>
          <p className="text-sm" style={{ marginBottom: 10 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={load}>Try again</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <Bell size={56} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
          <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>
            {filter === 'all' ? 'All caught up!' : `No ${filter} notifications`}
          </div>
          <p className="text-secondary text-sm">Real file activity, shares, and security alerts will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((notification) => {
            const style = TYPE_STYLE[notification.type] || TYPE_STYLE.access;
            const NotificationIcon = style.Icon;
            return (
              <div
                key={notification.id}
                className={`notif-item notification-row--${notification.type} ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => !notification.is_read && markRead(notification.id)}
              >
                <div className="notif-icon" style={{ background: style.bg, color: style.color }}>
                  <NotificationIcon size={20} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="notif-title">{notification.title}</div>
                  <div className="notif-desc">{notification.message}</div>
                  <div className="flex gap-2 items-center notif-time">
                    <span>{timeAgo(notification.created_at)}</span>
                    <span className={`badge badge-${notification.type === 'security' ? 'rose' : notification.type === 'share' ? 'blue' : 'cyan'}`} style={{ fontSize: '.625rem' }}>
                      {notification.category}
                    </span>
                  </div>
                </div>
                {!notification.is_read && <div className="unread-dot" aria-label="Unread" />}
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label={`Delete ${notification.title}`}
                  style={{ opacity: 0.65, marginLeft: 8 }}
                  onClick={(event) => { event.stopPropagation(); remove(notification.id); }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
