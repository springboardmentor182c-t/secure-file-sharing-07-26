import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../utils/api';

const TYPE_STYLE = {
  share:    { bg: 'rgba(59,130,246,.15)',  color: 'var(--blue-400)',   icon: '🔗' },
  security: { bg: 'rgba(244,63,94,.15)',   color: 'var(--rose-400)',   icon: '🛡️' },
  upload:   { bg: 'rgba(16,185,129,.15)',  color: 'var(--emerald-400)',icon: '⬆️' },
  access:   { bg: 'rgba(245,158,11,.15)',  color: 'var(--amber-400)',  icon: '👁️' },
  download: { bg: 'rgba(139,92,246,.15)',  color: 'var(--purple-400)', icon: '⬇️' },
};

const timeAgo = (dateStr) => {
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    notificationsAPI.list()
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const unread = items.filter(n => !n.is_read);
  const filtered = filter === 'all' ? items : filter === 'unread' ? unread : items.filter(n => n.category === filter);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await notificationsAPI.markAllRead();
    setItems(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const remove = async (id) => {
    await notificationsAPI.delete(id);
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const FILTERS = ['all', 'unread', 'shares', 'security', 'uploads', 'activity'];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Notifications</h1>
          <p className="text-muted text-sm mt-1">{unread.length} unread · {items.length} total</p>
        </div>
        <div className="flex gap-2">
          {unread.length > 0 && <button className="btn btn-secondary btn-sm" onClick={markAll}>✅ Mark All Read</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} {f === 'unread' && unread.length > 0 ? `(${unread.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔔</div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </div>
          <p className="text-secondary text-sm">You'll see file activity, shares, and security alerts here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(n => {
            const style = TYPE_STYLE[n.type] || TYPE_STYLE.access;
            return (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => !n.is_read && markRead(n.id)}>
                <div className="notif-icon" style={{ background: style.bg, color: style.color }}>{n.icon || style.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-desc">{n.message}</div>
                  <div className="flex gap-2 items-center notif-time">
                    <span>{timeAgo(n.created_at)}</span>
                    <span className={`badge badge-${n.type === 'security' ? 'rose' : n.type === 'share' ? 'blue' : 'cyan'}`} style={{ fontSize: '.625rem' }}>{n.category}</span>
                  </div>
                </div>
                {!n.is_read && <div className="unread-dot" />}
                <button className="btn btn-ghost btn-icon btn-sm" style={{ opacity: .5, marginLeft: 8 }}
                  onClick={e => { e.stopPropagation(); remove(n.id); }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
