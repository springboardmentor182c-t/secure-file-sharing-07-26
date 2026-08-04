import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiActivity, FiAlertTriangle, FiXCircle, FiDownload,
  FiSlash, FiRefreshCw, FiRotateCcw,
} from 'react-icons/fi';

import './ActivityLogs.css';
import { auditAPI } from '../utils/api';

const FILTERS = [
  { label: 'All Events', risk: null },
  { label: 'High Risk', risk: 'high' },
  { label: 'Medium Risk', risk: 'medium' },
  { label: 'Low Risk', risk: 'low' },
];

const RISK_BADGE = { high: 'badge-rose', medium: 'badge-amber', low: 'badge-emerald' };

const formatTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const errorText = (err, fallback) =>
  err?.response ? err.response.data?.detail || fallback
    : 'Cannot reach the server. Make sure the backend is running.';

export default function ActivityLogs() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All Events');
  const [busyIp, setBusyIp] = useState('');

  const activeRisk = FILTERS.find((f) => f.label === filter)?.risk ?? null;

  const load = useCallback(async (risk) => {
    setError('');
    try {
      const [ev, st, bl] = await Promise.all([
        auditAPI.list({ limit: 200, ...(risk ? { risk } : {}) }),
        auditAPI.stats(),
        auditAPI.listBlockedIps(),
      ]);
      setEvents(ev.data);
      setStats(st.data);
      setBlocked(bl.data);
    } catch (err) {
      setError(errorText(err, 'Could not load activity logs.'));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeRisk); }, [load, activeRisk]);

  const blockedIps = useMemo(() => blocked.map((b) => b.ip_address), [blocked]);

  // Suspicious addresses that are not already on the blocklist.
  const toBlock = useMemo(
    () => (stats?.suspicious_ips || []).filter((ip) => !blockedIps.includes(ip)),
    [stats, blockedIps],
  );

  const countFor = (f) => {
    if (!stats) return 0;
    if (!f.risk) {
      const { high, medium, low } = stats.risk_breakdown;
      return high + medium + low;
    }
    return stats.risk_breakdown[f.risk];
  };

  const exportCsv = async () => {
    try {
      const { data } = await auditAPI.exportCsv(activeRisk ? { risk: activeRisk } : {});
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorText(err, 'Export failed.'));
    }
  };

  const blockSuspicious = async () => {
    setError('');
    try {
      await Promise.all(
        toBlock.map((ip) => auditAPI.blockIp(ip, 'Flagged by access monitoring')),
      );
      await load(activeRisk);
    } catch (err) {
      setError(errorText(err, 'Could not block the address.'));
    }
  };

  const unblock = async (ip) => {
    setBusyIp(ip);
    try {
      await auditAPI.unblockIp(ip);
      await load(activeRisk);
    } catch (err) {
      setError(errorText(err, 'Could not unblock the address.'));
    } finally {
      setBusyIp('');
    }
  };

  if (loading) {
    return (
      <div className="al-center">
        <div className="spinner" />
      </div>
    );
  }

  const trend = stats?.total_events_change_pct;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="al-header">
        <div>
          <h1>Access Monitoring</h1>
          <p>Real-time audit logs and suspicious activity detection</p>
        </div>
        <div className="al-header-actions">
          <button className="btn btn-secondary" onClick={() => load(activeRisk)} title="Reload">
            <FiRefreshCw /> Refresh
          </button>
          <button className="btn btn-secondary" onClick={exportCsv} disabled={!events.length}>
            <FiDownload /> Export Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="al-error">
          <FiAlertTriangle /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard
          icon={<FiActivity />} tone="blue"
          value={(stats?.total_events_24h ?? 0).toLocaleString()} label="Total Events (24h)"
          trend={trend === null || trend === undefined ? null : `${trend > 0 ? '+' : ''}${trend}%`}
          trendUp={trend > 0}
        />
        <StatCard
          icon={<FiAlertTriangle />} tone="amber"
          value={stats?.suspicious_events ?? 0} label="Suspicious Events"
          trend={stats?.suspicious_events_24h ? `+${stats.suspicious_events_24h} today` : null}
        />
        <StatCard
          icon={<FiXCircle />} tone="purple"
          value={stats?.access_denied ?? 0} label="Access Denied"
        />
        <StatCard
          icon={<FiDownload />} tone="emerald"
          value={stats?.downloads_24h ?? 0} label="Downloads (24h)"
        />
      </div>

      {/* Suspicious activity banner */}
      {stats?.suspicious_events > 0 && (
        <div className="al-alert">
          <div className="al-alert-icon"><FiAlertTriangle /></div>
          <div className="al-alert-body">
            <h3>Suspicious Activity Detected</h3>
            <p>
              {stats.suspicious_events} high-risk{' '}
              {stats.suspicious_events === 1 ? 'event' : 'events'} recorded
              {stats.suspicious_ips.length > 0 && (
                <> from {stats.suspicious_ips.length}{' '}
                  {stats.suspicious_ips.length === 1 ? 'address' : 'addresses'}{' '}
                  ({stats.suspicious_ips.slice(0, 3).join(', ')}
                  {stats.suspicious_ips.length > 3 ? '…' : ''})
                </>
              )}.
            </p>
          </div>
          <button
            className="btn btn-danger al-block-btn"
            onClick={blockSuspicious}
            disabled={!toBlock.length}
          >
            <FiSlash /> {toBlock.length ? `Block IP (${toBlock.length})` : 'All Blocked'}
          </button>
        </div>
      )}

      {/* Blocked addresses */}
      {blocked.length > 0 && (
        <div className="card al-blocked-card">
          <h3><FiSlash /> Blocked Addresses</h3>
          <div className="al-blocked-list">
            {blocked.map((b) => (
              <span key={b.id} className="al-blocked-chip">
                <code>{b.ip_address}</code>
                {b.reason && <span className="al-muted">{b.reason}</span>}
                <button
                  onClick={() => unblock(b.ip_address)}
                  disabled={busyIp === b.ip_address}
                  title="Unblock"
                >
                  <FiRotateCcw />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risk filter pills */}
      <div className="al-filters">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`al-pill${filter === f.label ? ' active' : ''}`}
            onClick={() => setFilter(f.label)}
          >
            {f.label}
            <span className="al-pill-count">{countFor(f)}</span>
          </button>
        ))}
      </div>

      {/* Events table */}
      <div className="card al-table-card">
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Device</th>
                <th>Location</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="al-empty">
                    {activeRisk ? `No ${activeRisk}-risk events.` : 'No activity recorded yet.'}
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className={blockedIps.includes(e.ip_address) ? 'al-row-blocked' : ''}>
                    <td><span className={`badge ${RISK_BADGE[e.risk]}`}>{e.risk}</span></td>
                    <td className="al-truncate" title={e.user}>{e.user}</td>
                    <td>{e.action}</td>
                    <td className="al-truncate" title={e.resource}>{e.resource}</td>
                    <td className="al-mono">{e.ip_address || '—'}</td>
                    <td className="al-muted">{e.device || '—'}</td>
                    <td className="al-muted">{e.location || '—'}</td>
                    <td className="al-muted al-nowrap">{formatTime(e.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, tone, value, label, trend, trendUp }) {
  return (
    <div className="card stat-card">
      <div className="al-stat-top">
        <div className={`stat-icon tone-${tone}`}>{icon}</div>
        {trend && <span className={`stat-trend ${trendUp ? 'trend-up' : 'text-muted'}`}>{trend}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
