import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiUsers, FiDatabase, FiShield, FiAlertTriangle,
  FiEdit2, FiTrash2, FiFilter, FiPlus, FiCheck, FiX, FiCopy,
} from 'react-icons/fi';

import './Admin.css';
import { adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Users', 'Roles & Permissions', 'Storage', 'Audit Logs'];

const PLANS = ['free', 'team', 'enterprise'];

const ROLE_TONE = {
  admin: 'badge-rose',
  manager: 'badge-purple',
  member: 'badge-blue',
  guest: 'badge-cyan',
};

const BUCKET_COLOR = {
  Documents: 'var(--blue-500)',
  Media: 'var(--emerald-500)',
  Archives: 'var(--purple-500)',
  Other: 'var(--amber-500)',
};

const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const value = n / 1024 ** i;
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '—';

const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('Users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [storage, setStorage] = useState(null);
  const [logs, setLogs] = useState([]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [editing, setEditing] = useState(null);   // user being edited
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(null);   // { user, temp_password }

  // Only admins reach this page; the sidebar hides it, this is the hard gate.
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [s, u, r, st, l] = await Promise.all([
        adminAPI.stats(),
        adminAPI.listUsers(),
        adminAPI.listRoles(),
        adminAPI.storage(),
        adminAPI.auditLogs(100),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setRoles(r.data);
      setStorage(st.data);
      setLogs(l.data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadAll();
  }, [user, loadAll]);

  // Server-side search/filter, debounced so typing doesn't hammer the API.
  useEffect(() => {
    if (user?.role !== 'admin') return undefined;
    const id = setTimeout(() => {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      adminAPI.listUsers(params).then(({ data }) => setUsers(data)).catch(() => {});
    }, 300);
    return () => clearTimeout(id);
  }, [search, roleFilter, statusFilter, user]);

  const saveUser = async (id, patch) => {
    try {
      await adminAPI.updateUser(id, patch);
      setEditing(null);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update user.');
    }
  };

  const removeUser = async (target) => {
    if (!window.confirm(`Delete ${target.email}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(target.id);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="admin-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage users, roles, storage, and security policies</p>
        </div>
        <button className="btn btn-primary" onClick={() => setInviting(true)}>
          <FiPlus /> Invite User
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <FiAlertTriangle /> {error}
          <button className="admin-error-close" onClick={() => setError('')}><FiX /></button>
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard
          icon={<FiUsers />} tone="blue"
          value={stats?.total_users ?? 0} label="Total Users"
          trend={stats?.new_users_30d ? `+${stats.new_users_30d}` : null} trendUp
        />
        <StatCard
          icon={<FiDatabase />} tone="purple"
          value={formatBytes(stats?.storage_total_bytes)} label="Total Storage"
          trend={`${stats?.storage_used_pct ?? 0}% used`}
        />
        <StatCard
          icon={<FiShield />} tone="emerald"
          value={`${stats?.mfa_enabled_pct ?? 0}%`} label="MFA Enabled"
          trend={`${stats?.mfa_enabled_count ?? 0} of ${stats?.total_users ?? 0}`} trendUp
        />
        <StatCard
          icon={<FiAlertTriangle />} tone="amber"
          value={stats?.policy_violations ?? 0} label="Policy Violations"
          trend="last 30 days"
        />
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`admin-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Users' && (
        <UsersTab
          users={users}
          search={search} setSearch={setSearch}
          roles={roles}
          roleFilter={roleFilter} setRoleFilter={setRoleFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          showFilters={showFilters} setShowFilters={setShowFilters}
          currentUserId={user?.id}
          onEdit={setEditing}
          onDelete={removeUser}
        />
      )}

      {tab === 'Roles & Permissions' && <RolesTab roles={roles} />}

      {tab === 'Storage' && <StorageTab storage={storage} />}

      {tab === 'Audit Logs' && <AuditTab logs={logs} />}

      {editing && (
        <EditUserModal
          user={editing}
          roles={roles}
          onClose={() => setEditing(null)}
          onSave={saveUser}
        />
      )}

      {inviting && (
        <InviteUserModal
          roles={roles}
          onClose={() => setInviting(false)}
          onInvited={(payload) => {
            setInviting(false);
            setInvited(payload);
            loadAll();
          }}
        />
      )}

      {invited && <InviteResultModal result={invited} onClose={() => setInvited(null)} />}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────────── */

function StatCard({ icon, tone, value, label, trend, trendUp }) {
  return (
    <div className="card stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon tone-${tone}`}>{icon}</div>
        {trend && (
          <span className={`stat-trend ${trendUp ? 'trend-up' : 'text-muted'}`}>{trend}</span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ── Users tab ───────────────────────────────────────────────────────────── */

function UsersTab({
  users, search, setSearch, roles, roleFilter, setRoleFilter,
  statusFilter, setStatusFilter, showFilters, setShowFilters,
  currentUserId, onEdit, onDelete,
}) {
  return (
    <div className="card admin-panel-card">
      <div className="admin-toolbar">
        <div className="input-wrap admin-search">
          <FiSearch className="input-icon-l" />
          <input
            className="form-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`btn btn-secondary${showFilters ? ' active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          <FiFilter /> Filter
        </button>
      </div>

      {showFilters && (
        <div className="admin-filters">
          <select
            className="form-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          {(roleFilter || statusFilter) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setRoleFilter(''); setStatusFilter(''); }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Storage</th>
              <th>MFA</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="avatar av-md" style={{ background: u.avatar_color || 'var(--grad-primary)' }}>
                        {initials(u.name)}
                      </div>
                      <div className="admin-user-meta">
                        <div className="name">{u.name}</div>
                        <div className="email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ROLE_TONE[u.role] || 'badge-blue'}`}>{u.role}</span>
                  </td>
                  <td className="nowrap">
                    {formatBytes(u.storage_used)}
                    <span className="text-muted"> / {formatBytes(u.storage_quota)}</span>
                  </td>
                  <td>
                    <span className={`mfa-mark ${u.mfa_enabled ? 'on' : 'off'}`}>
                      {u.mfa_enabled ? <FiCheck /> : <FiX />}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-emerald' : 'badge-rose'}`}>
                      {u.is_active ? 'active' : 'suspended'}
                    </span>
                  </td>
                  <td className="nowrap text-secondary">{formatDate(u.created_at)}</td>
                  <td className="col-actions">
                    <div className="admin-row-actions">
                      <button
                        className="icon-btn"
                        title="Edit user"
                        onClick={() => onEdit(u)}
                        disabled={u.id === currentUserId}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Delete user"
                        onClick={() => onDelete(u)}
                        disabled={u.id === currentUserId}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Roles tab ───────────────────────────────────────────────────────────── */

function RolesTab({ roles }) {
  return (
    <div className="roles-grid">
      {roles.map((r) => (
        <div key={r.key} className="card role-card">
          <div className="role-head">
            <div className={`role-icon ${r.key}`}><FiShield /></div>
            <div>
              <h3>{r.label}</h3>
              <span className="text-muted text-sm">
                {r.user_count} {r.user_count === 1 ? 'user' : 'users'}
              </span>
            </div>
          </div>
          <div className="role-perms">
            {r.permissions.map((p) => (
              <span key={p} className="role-perm">{p}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Storage tab ─────────────────────────────────────────────────────────── */

function StorageTab({ storage }) {
  if (!storage) return null;

  const total = storage.total_bytes || 1;

  return (
    <>
      <div className="card admin-panel-card">
        <div className="storage-head">
          <h2>Storage Quota</h2>
          <span className="badge badge-blue">{formatBytes(storage.total_bytes)} Plan</span>
        </div>

        <div className="storage-usage-row">
          <span className="font-semibold">Used: {formatBytes(storage.used_bytes)}</span>
          <span className="text-secondary">
            {storage.used_pct}% of {formatBytes(storage.total_bytes)}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(storage.used_pct, 100)}%` }} />
        </div>

        <div className="storage-breakdown">
          {storage.breakdown.map((b) => (
            <div key={b.label} className="storage-bucket">
              <div className="bucket-track">
                <div
                  className="bucket-fill"
                  style={{
                    width: `${Math.min((b.bytes / total) * 100, 100)}%`,
                    background: BUCKET_COLOR[b.label] || 'var(--blue-500)',
                  }}
                />
              </div>
              <div className="bucket-value">{formatBytes(b.bytes)}</div>
              <div className="bucket-label">{b.label}</div>
              <div className="bucket-files">{b.files} {b.files === 1 ? 'file' : 'files'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card admin-panel-card">
        <h2 className="storage-head-simple">Top Consumers</h2>
        {storage.top_users.length === 0 ? (
          <div className="admin-empty">No usage recorded yet</div>
        ) : (
          storage.top_users.map((u) => {
            const pct = u.quota_bytes ? (u.used_bytes / u.quota_bytes) * 100 : 0;
            return (
              <div key={u.id} className="consumer-row">
                <div className="avatar av-sm" style={{ background: 'var(--grad-primary)' }}>
                  {initials(u.name)}
                </div>
                <div className="consumer-meta">
                  <div className="name">{u.name}</div>
                  <div className="email">{u.email}</div>
                </div>
                <div className="consumer-bar">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
                <div className="consumer-value nowrap">
                  {formatBytes(u.used_bytes)} <span className="text-muted">/ {formatBytes(u.quota_bytes)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/* ── Audit tab ───────────────────────────────────────────────────────────── */

function AuditTab({ logs }) {
  return (
    <div className="card admin-panel-card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="admin-empty">No audit activity recorded yet</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="mono nowrap text-secondary">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                  </td>
                  <td>{log.admin_name}</td>
                  <td>{log.action}</td>
                  <td className="truncate-cell">{log.target}</td>
                  <td>
                    <span className={`badge ${log.result === 'Success' ? 'badge-emerald' : 'badge-rose'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Modals ──────────────────────────────────────────────────────────────── */

function EditUserModal({ user, roles, onClose, onSave }) {
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState(user.plan);
  const [isActive, setIsActive] = useState(user.is_active);
  const [quotaGb, setQuotaGb] = useState(
    Math.max(1, Math.round((user.storage_quota || 0) / 1024 ** 3))
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(user.id, {
      role,
      plan,
      is_active: isActive,
      storage_quota: quotaGb * 1024 ** 3,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Edit User</div>
            <div className="card-subtitle">{user.email}</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className="form-input" value={plan} onChange={(e) => setPlan(e.target.value)}>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Storage quota (GB)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={quotaGb}
              onChange={(e) => setQuotaGb(Number(e.target.value))}
            />
          </div>

          <label className="toggle admin-toggle-row">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="toggle-track" />
            <span className="toggle-thumb" />
            <span className="text-sm">{isActive ? 'Account active' : 'Account suspended'}</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function InviteUserModal({ roles, onClose, onInvited }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'member', plan: 'free' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const { data } = await adminAPI.inviteUser(form);
      onInvited(data);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErr(typeof detail === 'string' ? detail : 'Failed to invite user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          <div className="modal-title">Invite User</div>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {err && <div className="form-error mb-3">{err}</div>}

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" value={form.name} onChange={set('name')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={set('role')}>
              {roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className="form-input" value={form.plan} onChange={set('plan')}>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Inviting...' : 'Send invite'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function InviteResultModal({ result, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(result.temp_password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">User invited</div>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p className="text-secondary mb-4">
            <strong>{result.user.name}</strong> ({result.user.email}) can sign in with this
            one-time password. It is shown only once — share it over a secure channel.
          </p>
          <div className="temp-password">
            <code>{result.temp_password}</code>
            <button className="btn btn-secondary btn-sm" onClick={copy}>
              <FiCopy /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
