import React, { useEffect, useState } from 'react';
import { auditAPI } from '../utils/api';
import { FiActivity } from 'react-icons/fi';

const levelBadge = (level) => {
  const l = (level || 'info').toLowerCase();
  if (l === 'warning' || l === 'warn') return 'badge-amber';
  if (l === 'error' || l === 'critical') return 'badge-rose';
  return 'badge-emerald';
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditAPI.list(100)
      .then(({ data }) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiActivity /> Activity Logs
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Audit trail of actions across your workspace
        </p>
      </div>

      <div className="card" style={{ padding: '8px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No activity recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{log.action}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                  {log.resource_type
                    ? `${log.resource_type}${log.resource_name ? ` · ${log.resource_name}` : ''}`
                    : '—'}
                  {log.ip_address ? ` · ${log.ip_address}` : ''}
                </div>
              </div>
              <span className={`badge ${levelBadge(log.level)}`}>{log.level || 'info'}</span>
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
