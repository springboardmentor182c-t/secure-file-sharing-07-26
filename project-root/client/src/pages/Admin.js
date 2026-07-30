import React, { useEffect, useState } from 'react';
import { adminAPI, auditAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../features/admin/components/AdminHeader";
import UserList from "../features/admin/components/UserList";
import AuditLog from "../features/admin/components/AuditLog";
import StatCards from "../features/admin/components/StatCards";
import SystemStatus from "../features/admin/components/SystemStatus";
import SearchBar from "../features/admin/components/SearchBar";
import useAdminData from "../features/admin/hooks/useAdminData";

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
  
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { users, setUsers, logs, loading } = useAdminData(user, navigate);

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
    <AdminHeader />
      {/* Stats */}
      <StatCards stats={stats} />

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
    
   {tab === "users" && (
    <SearchBar
    search={search}
    setSearch={setSearch}
    roleFilter={roleFilter}
    setRoleFilter={setRoleFilter}
    />
   )}

     {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="spinner" /></div>
     ) : tab === 'users' ? (
  <UserList
    users={users}
    search={search}
    roleFilter={roleFilter}
    user={user}
    toggleActive={toggleActive}
  />
) : tab === 'audit' ? (
  <AuditLog
    logs={logs}
    LEVEL_BADGE={LEVEL_BADGE}
    timeAgo={timeAgo}
  />
) : (
        <SystemStatus />
      )}
    </div>
  );
}
