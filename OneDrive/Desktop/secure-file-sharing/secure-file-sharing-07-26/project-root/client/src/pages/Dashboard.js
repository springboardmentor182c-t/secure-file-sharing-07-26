import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, filesAPI, sharesAPI, notificationsAPI } from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.summary().catch(() => null),
      filesAPI.list().catch(() => ({ data: { files: [] } })),
    ]).then(([analyticsRes, filesRes]) => {
      setAnalytics(analyticsRes?.data || null);
      setRecentFiles(filesRes.data.files.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  const storagePct = user ? Math.min(Math.round(user.storage_used / user.storage_quota * 100), 100) : 0;
  const storageUsedGB = user ? (user.storage_used / 1e9).toFixed(1) : '0';
  const storageQuotaGB = user ? (user.storage_quota / 1e9).toFixed(0) : '5';

  const fileIcon = (mime) => {
    if (!mime) return '📄';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('zip') || mime.includes('archive')) return '📦';
    if (mime.includes('spreadsheet') || mime.includes('excel')) return '📊';
    if (mime.includes('presentation')) return '📽️';
    return '📄';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  const stats = [
    { icon: '📁', label: 'Total Files', value: analytics?.total_files ?? 0, color: 'var(--blue-400)', trend: '↑ live', bg: 'rgba(59,130,246,.1)' },
    { icon: '🔗', label: 'Active Links', value: analytics?.active_share_links ?? 0, color: 'var(--purple-400)', trend: 'active', bg: 'rgba(139,92,246,.1)' },
    { icon: '👁️', label: 'Share Views', value: analytics?.total_share_views ?? 0, color: 'var(--emerald-400)', trend: 'total', bg: 'rgba(16,185,129,.1)' },
    { icon: '💾', label: 'Storage Used', value: `${storageUsedGB} GB`, color: 'var(--amber-400)', trend: `of ${storageQuotaGB} GB`, bg: 'rgba(245,158,11,.1)' },
  ];

  const quickActions = [
    { icon: '⬆️', label: 'Upload', color: '#3b82f6', action: () => navigate('/files') },
    { icon: '📁', label: 'New Folder', color: '#8b5cf6', action: () => navigate('/files') },
    { icon: '🔗', label: 'Share', color: '#10b981', action: () => navigate('/sharing') },
    { icon: '📊', label: 'Analytics', color: '#06b6d4', action: () => navigate('/analytics') },
    { icon: '🛡️', label: 'Security', color: '#ec4899', action: () => navigate('/admin') },
    { icon: '🔔', label: 'Alerts', color: '#f59e0b', action: () => navigate('/notifications') },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/files')}>📁 My Files</button>
          <button className="btn btn-primary" onClick={() => navigate('/files')}>⬆️ Upload File</button>
        </div>
      </div>

      {/* MFA warning */}
      {user && !user.mfa_enabled && (
        <div className="card flex items-center justify-between mb-4" style={{ padding: '14px 20px', borderColor: 'rgba(245,158,11,.25)', background: 'rgba(245,158,11,.05)' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--amber-400)' }}>Enable Two-Factor Authentication</div>
              <div className="text-xs text-secondary">Protect your account with an additional layer of security</div>
            </div>
          </div>
          <button className="btn btn-sm" onClick={() => navigate('/settings')} style={{ background: 'rgba(245,158,11,.15)', color: 'var(--amber-400)', border: '1px solid rgba(245,158,11,.3)', cursor: 'pointer' }}>
            Enable MFA
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid mb-6">
        {stats.map(s => (
          <div key={s.label} className="card stat-card" style={{ padding: 20 }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value grad-text">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-trend trend-up text-xs mt-2">{s.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent Files */}
          <div className="card card-pad">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">📄 Recent Files</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/files')}>View All →</button>
            </div>
            {recentFiles.length === 0 ? (
              <div className="text-center" style={{ padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📂</div>
                <div>No files yet</div>
                <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/files')}>Upload your first file</button>
              </div>
            ) : recentFiles.map(f => (
              <div key={f.id} className="file-item">
                <div className="file-icon" style={{ background: 'rgba(59,130,246,.1)', color: 'var(--blue-400)' }}>
                  {fileIcon(f.mimetype)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="file-name">{f.original_name}</div>
                  <div className="file-meta">{formatSize(f.size)}</div>
                </div>
                {f.encrypted && <span className="badge badge-emerald" style={{ fontSize: '.6875rem' }}>🔐 Encrypted</span>}
                <div className="file-actions">
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('/sharing')}>🔗</button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card card-pad">
            <h2 className="card-title mb-4">⚡ Quick Actions</h2>
            <div className="grid-3" style={{ gap: 10 }}>
              {quickActions.map(a => (
                <button key={a.label} onClick={a.action}
                  style={{ padding: '18px 8px', background: `${a.color}10`, border: `1px solid ${a.color}20`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all .2s', color: a.color }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${a.color}40` }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = `${a.color}20` }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                  <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Storage */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>💾 Storage</div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-sm font-semibold">{storageUsedGB} GB used</span>
                <span className="text-xs text-muted">of {storageQuotaGB} GB</span>
              </div>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${storagePct}%` }} />
              </div>
              <div className="text-xs text-secondary">{storagePct}% of your storage used</div>
            </div>
          </div>

          {/* Upload trend */}
          {analytics?.upload_trend && (
            <div className="card card-pad">
              <h3 className="card-title mb-4">📈 7-Day Uploads</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                {analytics.upload_trend.map((d, i) => {
                  const max = Math.max(...analytics.upload_trend.map(x => x.count), 1);
                  const h = (d.count / max) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div title={`${d.count} uploads`}
                        style={{ width: '100%', height: `${Math.max(h, 6)}%`, background: 'var(--grad-primary)', borderRadius: 4, minHeight: 4, opacity: d.count === 0 ? .2 : 1, transition: 'height .4s ease' }} />
                      <span style={{ fontSize: '.625rem', color: 'var(--text-muted)' }}>{d.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security */}
          <div className="card card-pad">
            <h3 className="card-title mb-4">🛡️ Security Status</h3>
            {[
              { label: 'MFA', value: user?.mfa_enabled ? '✅ Enabled' : '⚠️ Disabled', ok: user?.mfa_enabled },
              { label: 'Encryption', value: '✅ AES-256', ok: true },
              { label: 'Active Links', value: analytics?.active_share_links ?? 0, ok: true },
              { label: 'Plan', value: user?.plan || 'free', ok: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '.875rem' }}>
                <span className="text-secondary">{s.label}</span>
                <span style={{ fontWeight: 600, color: s.ok ? 'var(--emerald-400)' : 'var(--amber-400)' }}>{String(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
