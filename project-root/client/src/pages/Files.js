import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Files as FilesIcon, Share2, Lock, Activity,
  Bell, BarChart2, ShieldCheck, Moon, Sun, LogOut, Search, FolderPlus,
  Upload, Filter, List, LayoutGrid, Folder, ChevronRight, ChevronLeft,
  MoreVertical, Share, Download, Trash2, Check, FileText,
  FileSpreadsheet, Image, Presentation, User
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';

/* ─── Data ─────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: 'Dashboard',          icon: LayoutDashboard },
  { label: 'My Files',           icon: FilesIcon,      to: '/files', active: true },
  { label: 'Secure Sharing',     icon: Share2 },
  { label: 'Encryption',         icon: Lock },
  { label: 'Activity Logs',      icon: Activity },
  { label: 'Notifications',      icon: Bell,            badge: 4 },
  { label: 'Analytics',          icon: BarChart2 },
  { label: 'Admin Panel',        icon: ShieldCheck },
  { label: 'Profile & Settings', icon: User,            to: '/settings' },
];

const FOLDERS = [
  { name: 'Finance',     files: 24,  size: '12.4 GB', color: '#10b981', bg: '#d1fae5' },
  { name: 'Legal',       files: 18,  size: '5.2 GB',  color: '#3b82f6', bg: '#dbeafe' },
  { name: 'Engineering', files: 156, size: '34.1 GB', color: '#6366f1', bg: '#e0e7ff' },
  { name: 'Marketing',   files: 89,  size: '8.9 GB',  color: '#f59e0b', bg: '#fef3c7' },
];

const FILES = [
  {
    name: 'Q3 Financial Report.xlsx', versions: 5,
    icon: FileSpreadsheet, iconColor: '#10b981',
    size: '2.4 MB', modified: 'Jul 6, 2025', owner: 'Alex J.',
    tags: ['Encrypted', 'Shared'],
  },
  {
    name: 'Legal Agreement Draft.pdf', versions: 2,
    icon: FileText, iconColor: '#ef4444',
    size: '890 KB', modified: 'Jul 5, 2025', owner: 'Sarah C.',
    tags: ['Encrypted'],
  },
  {
    name: 'Project Roadmap.pptx', versions: 3,
    icon: Presentation, iconColor: '#f97316',
    size: '1.2 MB', modified: 'Jul 4, 2025', owner: 'Mike T.',
    tags: ['Encrypted', 'Shared'],
  },
  {
    name: 'Team Photo Archive.zip', versions: 1,
    icon: Image, iconColor: '#8b5cf6',
    size: '4.7 MB', modified: 'Jul 3, 2025', owner: 'Emma R.',
    tags: ['Encrypted'],
  },
  {
    name: 'Budget Q4 2025.xlsx', versions: 4,
    icon: FileSpreadsheet, iconColor: '#10b981',
    size: '3.1 MB', modified: 'Jul 2, 2025', owner: 'Alex J.',
    tags: ['Encrypted', 'Shared'],
  },
];

/* ─── Tag badge ─────────────────────────────────────────────────── */
function Tag({ label }) {
  const styles = {
    Encrypted: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    Shared:    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  };
  const s = styles[label] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {label === 'Encrypted' && (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      {label}
    </span>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle, user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      minWidth: collapsed ? 64 : 220,
      background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0,
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10, padding: '18px 14px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0,
            }}>SC</div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
              SecureShare
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.75rem',
          }}>SC</div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
            borderRadius: 6, padding: '4px 6px', color: '#94a3b8',
            display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ label, icon: Icon, active, badge, to }) => (
          <button
            key={label}
            type="button"
            title={collapsed ? label : undefined}
            onClick={() => to && navigate(to)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '10px 0' : '9px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: active ? '#3b82f6' : 'transparent',
              color: active ? '#fff' : '#94a3b8',
              fontWeight: active ? 600 : 400,
              fontSize: '0.95rem',
              width: '100%', textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            {!collapsed && badge && (
              <span style={{
                marginLeft: 'auto', background: '#3b82f6', color: '#fff',
                borderRadius: 99, fontSize: '0.65rem', fontWeight: 700,
                padding: '1px 6px', lineHeight: 1.6,
              }}>{badge}</span>
            )}
            {collapsed && badge && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button
          type="button"
          onClick={onToggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '9px 12px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#94a3b8',
            fontSize: '0.95rem', width: '100%', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ flexShrink: 0 }} /> : <Moon size={18} style={{ flexShrink: 0 }} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          type="button"
          title={collapsed ? 'Sign Out' : undefined}
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '9px 12px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#ef4444',
            fontSize: '0.95rem', fontWeight: 600, width: '100%', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── Top Bar ───────────────────────────────────────────────────── */
function TopBar({ user, colors }) {
  const navigate = useNavigate();
  return (
    <div style={{
      height: 60, background: colors.bgTopBar,
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
      transition: 'background-color 0.2s, border-color 0.2s',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Search size={15} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: colors.textMuted,
        }} />
        <input
          type="text"
          placeholder="Search files, users, logs..."
          style={{
            width: '100%', padding: '8px 12px 8px 36px',
            border: `1px solid ${colors.inputBorder}`, borderRadius: 8,
            background: colors.inputBg, fontSize: '0.85rem', color: colors.textPrimary,
            outline: 'none', boxSizing: 'border-box',
            transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
          }}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button type="button" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: 8, color: colors.textSecondary,
            display: 'flex', alignItems: 'center',
          }}>
            <Bell size={20} />
          </button>
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 8, height: 8, borderRadius: '50%',
            background: '#3b82f6', border: `2px solid ${colors.bgTopBar}`,
          }} />
        </div>

        {/* User */}
        <div
          onClick={() => navigate('/settings')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
          }}>
            {(user?.full_name || 'AJ').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
              {user?.full_name || 'Alex Johnson'}
            </div>
            <div style={{ fontSize: '0.7rem', color: colors.textMuted }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function Files() {
  const { user, logoutUser, theme, toggleTheme } = useAnalytics();
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selected, setSelected] = useState(new Set());
  const inputRef = useRef();

  const isDark = theme === 'dark';
  const colors = {
    bgPage: isDark ? '#0f172a' : '#f0f4f8',
    bgCard: isDark ? '#1e293b' : '#ffffff',
    bgTopBar: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e8edf2',
    borderDashed: isDark ? '#475569' : '#cbd5e1',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    rowHover: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafbfc',
    inputBg: isDark ? '#0f172a' : '#f8fafc',
    inputBorder: isDark ? '#334155' : '#e2e8f0',
    folderCardHoverBorder: isDark ? '#475569' : '#c7d7e8',
  };

  const filteredFiles = FILES.filter(f =>
    f.name.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleSelect = (name) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const allSelected = filteredFiles.length > 0 && filteredFiles.every(f => selected.has(f.name));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredFiles.map(f => f.name)));
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: colors.bgPage,
      transition: 'background-color 0.2s',
    }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        user={user}
        onLogout={logoutUser}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar user={user} colors={colors} />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* Page heading */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>My Files</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.8rem', color: colors.textMuted }}>
                <span style={{ cursor: 'pointer' }}>Home</span>
                <ChevronRight size={13} />
                <span style={{ color: colors.textSecondary, fontWeight: 500 }}>My Files</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 8,
                border: `1.5px solid ${colors.borderDashed}`, background: colors.bgCard,
                color: colors.textPrimary, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}>
                <FolderPlus size={16} /> New Folder
              </button>
              <button type="button" style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 8,
                border: 'none', background: '#3b82f6',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={16} /> Upload
              </button>
              <input ref={inputRef} type="file" multiple style={{ display: 'none' }} />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#3b82f6' : colors.borderDashed}`,
              borderRadius: 12,
              background: dragging ? 'rgba(59,130,246,0.04)' : colors.bgCard,
              padding: '32px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              cursor: 'pointer', marginBottom: 24,
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `2px solid ${colors.borderDashed}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.textMuted,
            }}>
              <Upload size={20} />
            </div>
            <div style={{ fontSize: '0.9rem', color: colors.textSecondary }}>
              Drag &amp; drop files here, or{' '}
              <span style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'underline' }}>browse</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
              Supports all file types · AES-256 encrypted on upload · Max 5 GB per file
            </div>
          </div>

          {/* Folders */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 14px' }}>Folders</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {FOLDERS.map(f => (
                <div
                  key={f.name}
                  style={{
                    background: colors.bgCard, borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    padding: '16px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = colors.folderCardHoverBorder; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = colors.border; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: f.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Folder size={20} color={f.color} fill={f.color} style={{ opacity: 0.8 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: colors.textPrimary }}>{f.name}</div>
                    <div style={{ fontSize: '0.72rem', color: colors.textMuted, marginTop: 2 }}>
                      {f.files} files · {f.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files section */}
          <div style={{ background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            {/* Filter bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px 7px 30px',
                    border: `1px solid ${colors.inputBorder}`, borderRadius: 8,
                    fontSize: '0.82rem', color: colors.textPrimary, background: colors.inputBg,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button type="button" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                border: `1px solid ${colors.inputBorder}`, background: colors.bgCard,
                color: colors.textSecondary, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
              }}>
                <Filter size={14} /> Filter
              </button>
              <button type="button" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                border: `1px solid ${colors.inputBorder}`, background: colors.bgCard,
                color: colors.textSecondary, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" />
                </svg>
                Sort
              </button>

              {/* View toggle */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: 8, padding: 3 }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: viewMode === 'list' ? '#3b82f6' : 'transparent',
                    color: viewMode === 'list' ? '#fff' : colors.textMuted,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                    color: viewMode === 'grid' ? '#fff' : colors.textMuted,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ width: 44, padding: '10px 0 10px 18px' }}>
                    <Checkbox checked={allSelected} onChange={toggleAll} colors={colors} />
                  </th>
                  {['NAME', 'SIZE', 'MODIFIED', 'OWNER', 'STATUS', ''].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: 'left', padding: '10px 12px',
                        fontSize: '0.65rem', fontWeight: 700, color: colors.textMuted,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((f, i) => {
                  const Icon = f.icon;
                  const isSelected = selected.has(f.name);
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: i < filteredFiles.length - 1 ? `1px solid ${colors.border}` : 'none',
                        background: isSelected ? 'rgba(59,130,246,0.04)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = colors.rowHover; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 0 12px 18px' }}>
                        <Checkbox checked={isSelected} onChange={() => toggleSelect(f.name)} colors={colors} />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: f.iconColor + '18',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Icon size={17} color={f.iconColor} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary }}>{f.name}</div>
                            <div style={{ fontSize: '0.7rem', color: colors.textMuted, marginTop: 1 }}>
                              {f.versions} version{f.versions !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>{f.size}</td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>{f.modified}</td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>{f.owner}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {f.tags.map(t => <Tag key={t} label={t} />)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px 12px 4px' }}>
                        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          {[
                            { icon: Share,        title: 'Share' },
                            { icon: Download,     title: 'Download' },
                            { icon: Trash2,       title: 'Delete', danger: true },
                            { icon: MoreVertical, title: 'More' },
                          ].map(({ icon: Ic, title, danger }) => (
                            <button
                              key={title}
                              type="button"
                              title={title}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '5px', borderRadius: 6,
                                color: danger ? '#ef4444' : colors.textMuted,
                                display: 'flex', alignItems: 'center',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'); e.currentTarget.style.color = danger ? '#ef4444' : colors.textSecondary; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = danger ? '#ef4444' : colors.textMuted; }}
                            >
                              <Ic size={14} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredFiles.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '0.85rem' }}>
                No files match your filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Checkbox ───────────────────────────────────────────────────── */
function Checkbox({ checked, onChange, colors }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: 4,
        border: `2px solid ${checked ? '#3b82f6' : (colors ? colors.borderDashed : '#cbd5e1')}`,
        background: checked ? '#3b82f6' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
      }}
    >
      {checked && <Check size={10} color="#fff" strokeWidth={3} />}
    </div>
  );
}
