import React, { useEffect, useState } from 'react';
import { sharesAPI, filesAPI } from '../utils/api';

export default function Sharing() {
  const [shares, setShares] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ file_id: '', permission: 'view', max_views: '', password: '', expires_at: '' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([sharesAPI.list(), filesAPI.list()])
      .then(([s, f]) => { setShares(s.data); setFiles(f.data.files); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        file_id: parseInt(form.file_id),
        permission: form.permission,
        max_views: form.max_views ? parseInt(form.max_views) : null,
        password: form.password || null,
        expires_at: form.expires_at || null,
      };
      await sharesAPI.create(payload);
      showToast('Share link created!');
      setShowCreate(false);
      setForm({ file_id: '', permission: 'view', max_views: '', password: '', expires_at: '' });
      load();
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to create share', 'error');
    } finally { setCreating(false); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this share link?')) return;
    try { await sharesAPI.revoke(id); showToast('Share link revoked'); load(); }
    catch { showToast('Revoke failed', 'error'); }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const permBadge = { view: 'badge-blue', download: 'badge-purple', edit: 'badge-emerald' };
  const permIcon = { view: '👁️', download: '⬇️', edit: '✏️' };

  return (
    <div className="fade-in">
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999 }}>
          <div className="toast-msg">{toast.type === 'error' ? '❌' : '✅'} {toast.msg}</div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Sharing Center</h1>
          <p className="text-muted text-sm mt-1">{shares.filter(s => s.is_active).length} active links · {shares.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ Close' : '+ New Share Link'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card mb-6" style={{ padding: 24, borderColor: 'var(--border-accent)' }}>
          <h2 style={{ fontWeight: 700, marginBottom: 18 }}>🔗 Create Share Link</h2>
          <form onSubmit={handleCreate}>
            <div className="grid-2 mb-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Select File</label>
                <select className="form-input" value={form.file_id} onChange={e => setForm(f => ({ ...f, file_id: e.target.value }))} required>
                  <option value="">Choose a file…</option>
                  {files.map(f => <option key={f.id} value={f.id}>{f.original_name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Permission Level</label>
                <select className="form-input" value={form.permission} onChange={e => setForm(f => ({ ...f, permission: e.target.value }))}>
                  <option value="view">👁️ View Only</option>
                  <option value="download">⬇️ Download</option>
                  <option value="edit">✏️ Edit</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Max Views (optional)</label>
                <input className="form-input" type="number" min="1" placeholder="Unlimited" value={form.max_views} onChange={e => setForm(f => ({ ...f, max_views: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Expires At (optional)</label>
                <input className="form-input" type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Password Protection (optional)</label>
                <input className="form-input" type="password" placeholder="Leave blank for no password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? '⏳ Creating…' : '🔗 Generate Link'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="spinner" /></div>
      ) : shares.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔗</div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>No share links yet</div>
          <p className="text-secondary text-sm mb-4">Create a share link to send files securely</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Create First Link</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shares.map(s => (
            <div key={s.id} className="card" style={{ padding: '18px 20px', opacity: s.is_active ? 1 : .5, borderColor: s.is_active ? 'var(--border-subtle)' : 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,.1)', color: 'var(--blue-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {permIcon[s.permission]}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '.875rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {s.link}
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`badge ${permBadge[s.permission]}`}>{s.permission}</span>
                      {!s.is_active && <span className="badge badge-rose">Revoked</span>}
                      <span className="text-xs text-muted">
                        👁 {s.access_count}{s.max_views ? `/${s.max_views}` : ''} views
                      </span>
                      {s.expires_at && (
                        <span className="text-xs text-muted">⏱ Expires {new Date(s.expires_at).toLocaleDateString()}</span>
                      )}
                      {s.password_hash !== undefined && s.password_hash === null ? null : (
                        <span className="badge badge-amber" style={{ fontSize: '.625rem' }}>🔒 Password</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-sm ${copied === s.id ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => copyLink(s.link, s.id)}
                  >
                    {copied === s.id ? '✅ Copied!' : '📋 Copy Link'}
                  </button>
                  {s.is_active && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleRevoke(s.id)}>🚫 Revoke</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
