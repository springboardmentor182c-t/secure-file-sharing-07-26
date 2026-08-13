import React, { useCallback, useEffect, useState } from 'react';
import {
  Share2, Download, ShieldAlert, LogIn, Clock, Bell,
  CheckCheck, Trash2, RefreshCw, AlertTriangle,
} from 'lucide-react';

import './Notifications.css';
import { notificationsAPI } from '../utils/api';

const FILTERS = [
  { label: 'All',           type: null },
  { label: 'Share',         type: 'share' },
  { label: 'Download',      type: 'download' },
  { label: 'Access Denied', type: 'access_denied' },
  { label: 'Login',         type: 'login' },
  { label: 'Expiry',        type: 'expiry' },
];

// Icon + colour tone per notification category.
const TYPE_META = {
  share:         { icon: Share2,      tone: 'blue' },
  download:      { icon: Download,    tone: 'emerald' },
  access_denied: { icon: ShieldAlert, tone: 'rose' },
  login:         { icon: LogIn,       tone: 'amber' },
  expiry:        { icon: Clock,       tone: 'purple' },
  info:          { icon: Bell,        tone: 'blue' },
};

const metaFor = (type) => TYPE_META[type] || TYPE_META.info;

// Naive timestamps (SQLite/Postgres) arrive without a zone — read them as UTC.
const parseDate = (value) => {
  if (typeof value !== 'string') return null;
  const iso = /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const relativeTime = (value) => {
  const then = parseDate(value);
  if (!then) return '';

  const mins = Math.floor((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ago`;

  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const errorText = (err, fallback) =>
  err?.response ? err.response.data?.detail || fallback
    : 'Cannot reach the server. Make sure the backend is running.';

export default function Notifications({ onUnreadChange }) {
  const [items, setItems]     = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('All');
  const [busy, setBusy]       = useState(false);

  const activeType = FILTERS.find((f) => f.label === filter)?.type ?? null;

  const publishUnread = useCallback((count) => {
    setUnread(count);
    if (onUnreadChange) onUnreadChange(count);
  }, [onUnreadChange]);

  const load = useCallback(async (type) => {
    setError('');
    try {
      const [list, sum] = await Promise.all([
        notificationsAPI.list(type ? { type } : {}),
        notificationsAPI.summary(),
      ]);
      setItems(list.data || []);
      publishUnread(sum.data?.unread ?? 0);
    } catch (err) {
      setError(errorText(err, 'Could not load notifications.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [publishUnread]);

  useEffect(() => { load(activeType); }, [load, activeType]);

  const markRead = async (n) => {
    if (n.read) return;

    // Optimistic: flip the row and drop the badge, roll back if the call fails.
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    publishUnread(Math.max(unread - 1, 0));

    try {
      await notificationsAPI.markRead(n.id);
    } catch (err) {
      setError(errorText(err, 'Could not mark the notification as read.'));
      load(activeType);
    }
  };

  const markAllRead = async () => {
    setBusy(true);
    setError('');
    try {
      await notificationsAPI.markAllRead();
      await load(activeType);
    } catch (err) {
      setError(errorText(err, 'Could not mark notifications as read.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (n) => {
    setError('');
    try {
      await notificationsAPI.delete(n.id);
      await load(activeType);
    } catch (err) {
      setError(errorText(err, 'Could not delete the notification.'));
    }
  };

  if (loading) {
    return (
      <div className="nt-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="nt-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unread === 0
              ? 'You are all caught up'
              : `${unread} unread ${unread === 1 ? 'notification' : 'notifications'}`}
          </p>
        </div>
        <div className="nt-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => load(activeType)}
            title="Reload"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            className="nt-mark-all"
            onClick={markAllRead}
            disabled={busy || unread === 0}
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        </div>
      </div>

      {error && (
        <div className="nt-error">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Category filters */}
      <div className="nt-filters">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`nt-chip${filter === f.label ? ' active' : ''}`}
            onClick={() => setFilter(f.label)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="nt-empty">
          <div className="nt-empty-icon"><Bell size={22} /></div>
          <h3>Nothing here yet</h3>
          <p>
            {activeType
              ? `No ${filter.toLowerCase()} notifications so far.`
              : 'Shares, downloads and security alerts will show up here.'}
          </p>
        </div>
      ) : (
        <div className="nt-list">
          {items.map((n) => {
            const { icon: Icon, tone } = metaFor(n.type);
            return (
              <div
                key={n.id}
                className={`nt-card${n.read ? '' : ' unread'}`}
                onClick={() => markRead(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') markRead(n); }}
              >
                <div className={`nt-icon tone-${tone}`}><Icon size={18} /></div>

                <div className="nt-body">
                  <div className="nt-title">{n.title}</div>
                  <div className="nt-message">{n.message}</div>
                </div>

                <div className="nt-meta">
                  <span className="nt-time">{relativeTime(n.created_at)}</span>
                  {!n.read && <span className="nt-dot" title="Unread" />}
                  <button
                    className="nt-delete"
                    title="Delete notification"
                    onClick={(e) => { e.stopPropagation(); remove(n); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
