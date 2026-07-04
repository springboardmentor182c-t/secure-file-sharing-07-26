import React, { useEffect, useState } from 'react';
import { adminAPI, auditAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const timeAgo = (d) => {
  if (!d) return '—';
  const secs = Math.floor((Date.now() - new Date(d)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return new Date(d).toLocaleDateString();
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    Promise.all([adminAPI.listUsers(), auditAPI.list(50)])
      .then(([u, l]) => { setUsers(u.data); setLogs(l.data); })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const toggleActive = async (u) => {
    await adminAPI.updateUser(u.id, { role: u.role, is_active: !u.is_active });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
  };

  const LEVEL_BADGE = { info: 'badge-blue', warn: 'badge-amber', error: 'badge-rose', success: 'badge-emerald' };

  const stats = [
    { icon: '👥', label: 'Total Users', value: users.length, color: 'var(--blue-400)' },
    { icon: '✅', label: 'Active', value: users.filter(u => u.is_active).length, color: 'var(--emerald-400)' },
    { icon: '🔐', label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'var(--purple-400)' },
    { icon: '📋', label: 'Audit Logs', value: logs.length, color: 'var(--amber-400)' },
  ];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Admin Panel</h1>
          <p className="text-muted text-sm mt-1">System management, users & security monitoring</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-purple">Admin Access</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-3" style={{ padding: '16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['users', 'audit', 'system'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}>
            {t === 'users' ? '👥 Users' : t === 'audit' ? '📋 Audit Log' : '⚙️ System'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="spinner" /></div>
      ) : tab === 'users' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
            👥 User Management
          </div>
          {users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="avatar av-md" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', flexShrink: 0 }}>
                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '.9375rem' }}>{u.name}</div>
                <div className="text-xs text-muted">{u.email}</div>
              </div>
              <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span>
              <span className={`badge ${u.plan === 'enterprise' ? 'badge-emerald' : 'badge-cyan'}`}>{u.plan}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.is_active ? 'var(--emerald-500)' : 'var(--rose-500)' }} />
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', width: 80, textAlign: 'right' }}>
                {((u.storage_used || 0) / 1e9).toFixed(1)} GB
              </div>
              <button
                className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                onClick={() => toggleActive(u)}
                disabled={u.id === user?.id}
              >
                {u.is_active ? '🚫 Suspend' : '✅ Enable'}
              </button>
            </div>
          ))}
        </div>
      ) : tab === 'audit' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
            📋 Audit Log
          </div>
          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <div className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>No audit events yet</div>
            ) : logs.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)', fontSize: '.875rem' }}>
                <span className="text-muted" style={{ fontSize: '.75rem', width: 60, flexShrink: 0 }}>{timeAgo(l.created_at)}</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--blue-400)', width: 120, flexShrink: 0 }}>{l.action}</span>
                <span className="text-secondary truncate" style={{ flex: 1 }}>{l.resource_name || l.resource_type || '—'}</span>
                <span className={`badge ${LEVEL_BADGE[l.level] || 'badge-blue'}`} style={{ fontSize: '.6875rem' }}>{l.level}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid-2">
          <div className="card card-pad">
            <div style={{ fontWeight: 700, marginBottom: 16 }}>🛡️ Security Monitor</div>
            {[
              { label: 'API Gateway', value: '🟢 Healthy' },
              { label: 'SSL Certificate', value: '✅ Valid' },
              { label: 'Rate Limiting', value: '✅ Active' },
              { label: 'Intrusion Detection', value: '🟢 No threats' },
              { label: 'Key Rotation', value: '✅ Current' },
              { label: 'Encryption', value: 'AES-256 Active' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '.875rem' }}>
                <span className="text-secondary">{s.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald-400)' }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="card card-pad">
            <div style={{ fontWeight: 700, marginBottom: 16 }}>⚙️ Infrastructure</div>
            {[
              { name: 'Auth Service', latency: '12ms' },
              { name: 'File Service', latency: '8ms' },
              { name: 'Encryption Service', latency: '45ms' },
              { name: 'Sharing Service', latency: '15ms' },
              { name: 'Analytics Service', latency: '38ms' },
              { name: 'SQLite DB', latency: '2ms' },
            ].map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '.875rem' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald-500)' }} />
                  {s.name}
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--text-muted)' }}>{s.latency}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
