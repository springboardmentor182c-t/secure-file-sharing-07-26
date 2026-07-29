import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, Share2, Lock, Activity,
  Bell, BarChart2, Users, Settings, Sun, Moon, LogOut,
  ShieldCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/files',         icon: FolderOpen,      label: 'My Files' },
  { to: '/sharing',       icon: Share2,           label: 'Secure Sharing' },
  { to: '/encryption',    icon: Lock,             label: 'Encryption' },
  { to: '/activity',      icon: Activity,         label: 'Activity Logs' },
  { to: '/notifications', icon: Bell,             label: 'Notifications', badge: true },
  { to: '/analytics',     icon: BarChart2,        label: 'Analytics' },
  { to: '/admin',         icon: Users,            label: 'Admin Panel', adminOnly: true },
  { to: '/settings',      icon: Settings,         label: 'Profile & Settings' },
];

export default function Sidebar({ unreadCount = 0, collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const borderColor = 'rgba(255,255,255,0.06)';
  const bg          = '#0b1120';
  const textMuted   = '#475569';
  const textNav     = '#94a3b8';
  const textPrimary = '#f1f5f9';
  const textSecond  = '#64748b';

  const avatar = user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside style={{
      width: collapsed ? 68 : 240,
      minWidth: collapsed ? 68 : 240,
      background: bg,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 200,
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
      borderRight: `1px solid ${borderColor}`,
    }}>

      {/* ── Logo row ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: collapsed ? '18px 0' : '18px 16px 16px',
        justifyContent: collapsed ? 'center' : 'space-between',
        flexShrink: 0,
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.35)',
          }}>
            <ShieldCheck size={19} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{
              color: textPrimary, fontWeight: 700, fontSize: '1.08rem',
              letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>SecureShare</span>
          )}
        </div>
        {!collapsed && (
          <button onClick={onToggle} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: textMuted, padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand chevron when collapsed */}
      {collapsed && (
        <button onClick={onToggle} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: textMuted, padding: '8px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%',
        }}>
          <ChevronRight size={16} />
        </button>
      )}

      {/* ── Nav links ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 0' }}>
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '11px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 9, cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  margin: '1px 0',
                  background: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
                  color: isActive ? '#60a5fa' : textNav,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  position: 'relative',
                }}>
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                  {/* Badge expanded */}
                  {!collapsed && item.badge && unreadCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#3b82f6', color: '#fff',
                      fontSize: '0.65rem', fontWeight: 700,
                      padding: '2px 7px', borderRadius: 999,
                      minWidth: 20, textAlign: 'center',
                    }}>{unreadCount}</span>
                  )}
                  {/* Badge collapsed */}
                  {collapsed && item.badge && unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 5, right: 5,
                      width: 15, height: 15, borderRadius: '50%',
                      background: '#3b82f6', color: '#fff',
                      fontSize: '0.55rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount}</span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User info ── */}
      <div
        onClick={() => navigate('/settings')}
        title={collapsed ? (user?.name || 'Profile') : undefined}
        style={{
          display: 'flex', alignItems: 'center',
          gap: 10,
          padding: collapsed ? '14px 0' : '12px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderTop: `1px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: user?.avatar_color || 'linear-gradient(135deg,#3b82f6,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.8rem',
        }}>
          {avatar}
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 700,
              color: textPrimary, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.name || 'User'}</div>
            <div style={{
              fontSize: '0.7rem', color: textSecond,
              textTransform: 'capitalize',
            }}>{user?.role || 'member'}</div>
          </div>
        )}
      </div>

      {/* ── Bottom actions ── */}
      <div style={{
        padding: '6px 10px 14px',
        borderTop: `1px solid ${borderColor}`,
        display: 'flex', flexDirection: 'column', gap: 1,
        flexShrink: 0,
      }}>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          title={collapsed ? (dark ? 'Light Mode' : 'Dark Mode') : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px 0' : '9px 14px',
            borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'transparent', color: textNav,
            fontSize: '0.875rem', width: '100%', textAlign: 'left',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {dark
            ? <Sun  size={16} style={{ flexShrink: 0, opacity: 0.75 }} />
            : <Moon size={16} style={{ flexShrink: 0, opacity: 0.75 }} />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px 0' : '9px 14px',
            borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#ef4444',
            fontSize: '0.875rem', width: '100%', textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
