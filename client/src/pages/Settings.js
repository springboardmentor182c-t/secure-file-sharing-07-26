import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Files as FilesIcon, Share2, Lock, Activity,
  Bell, BarChart2, ShieldCheck, Moon, Sun, LogOut, Search,
  ChevronRight, ChevronLeft, User, Edit3, Mail, Briefcase, Box, Globe, Fingerprint
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';

/* ─── Data ─────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: 'Dashboard',          icon: LayoutDashboard },
  { label: 'My Files',           icon: FilesIcon,              to: '/files' },
  { label: 'Secure Sharing',     icon: Share2 },
  { label: 'Encryption',         icon: Lock },
  { label: 'Activity Logs',      icon: Activity },
  { label: 'Notifications',      icon: Bell,            badge: 4 },
  { label: 'Analytics',          icon: BarChart2 },
  { label: 'Admin Panel',        icon: ShieldCheck },
  { label: 'Profile & Settings', icon: User,            to: '/settings', active: true },
];

/* ─── Sidebar Component ────────────────────────────────────────── */
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

/* ─── Top Bar Component ────────────────────────────────────────── */
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

/* ─── Profile & Settings Page ───────────────────────────────────── */
export default function Settings() {
  const { user, logoutUser, theme, toggleTheme } = useAnalytics();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Personal Info');

  // Personal Info State
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Johnson');
  const [email, setEmail] = useState('alex@company.com');
  const [jobTitle, setJobTitle] = useState('Chief Technology Officer');
  const [department, setDepartment] = useState('Engineering');
  const [language, setLanguage] = useState('en');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(true);

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
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#cbd5e1',
    tabUnderline: '#3b82f6',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: `1.5px solid ${colors.inputBorder}`,
    borderRadius: 8,
    background: colors.inputBg,
    fontSize: '0.85rem',
    color: colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
  };

  const labelStyle = {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: 6,
    display: 'block',
  };

  const iconStyle = {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.textMuted,
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
          
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
              Profile &amp; Settings
            </h1>
            <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: '4px 0 0' }}>
              Manage your account settings and preferences
            </p>
          </div>

          {/* User Banner Card */}
          <div style={{
            background: colors.bgCard,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16,
                background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.5rem',
              }}>
                AJ
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
                  Alex Johnson
                </h2>
                <p style={{ fontSize: '0.82rem', color: colors.textMuted, margin: '4px 0 8px' }}>
                  alex@company.com &middot; Administrator
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                    background: '#e0f2fe', color: '#0369a1',
                  }}>Pro Plan</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                    background: '#d1fae5', color: '#047857',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    MFA Enabled
                  </span>
                </div>
              </div>
            </div>
            
            <button type="button" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              border: `1px solid ${colors.borderDashed}`, background: colors.bgCard,
              color: colors.textPrimary, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}>
              <Edit3 size={15} /> Edit Photo
            </button>
          </div>

          {/* Tab Selection */}
          <div style={{
            display: 'flex',
            gap: 20,
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: 24,
            paddingBottom: 2,
          }}>
            {[
              { label: 'Personal Info' },
              { label: 'Security' },
              { label: 'Sessions' },
              { label: 'Notifications' },
              { label: 'Preferences' }
            ].map(tab => (
              <span
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: activeTab === tab.label ? colors.tabUnderline : colors.textMuted,
                  paddingBottom: 10,
                  borderBottom: activeTab === tab.label ? `2.5px solid ${colors.tabUnderline}` : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  bottom: -1.5,
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </span>
            ))}
          </div>

          {/* Conditional Rendering of Forms */}
          {activeTab === 'Personal Info' && (
            <div style={{
              background: colors.bgCard,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              padding: 24,
              maxWidth: 800,
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 20px' }}>
                Personal Information
              </h3>

              <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Row 1: Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={iconStyle} />
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={iconStyle} />
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={iconStyle} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label style={labelStyle}>Job Title</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} style={iconStyle} />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label style={labelStyle}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <Box size={16} style={iconStyle} />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label style={labelStyle}>Language</label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={16} style={iconStyle} />
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: 38,
                        cursor: 'pointer',
                        appearance: 'none',
                      }}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                    <div style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: colors.textMuted, fontSize: '0.75rem'
                    }}>▼</div>
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ marginTop: 8 }}>
                  <button type="submit" style={{
                    padding: '10px 24px', borderRadius: 8,
                    border: 'none', background: '#3b82f6',
                    color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
              {/* Change Password Card */}
              <div style={{
                background: colors.bgCard,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: 24,
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: colors.textPrimary, margin: '0 0 20px' }}>
                  Change Password
                </h3>
                <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={iconStyle} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={iconStyle} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={iconStyle} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button type="submit" style={{
                      padding: '10px 24px', borderRadius: 8,
                      border: 'none', background: '#3b82f6',
                      color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                      onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication Card */}
              <div style={{
                background: colors.bgCard,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(59,130,246,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3b82f6', flexShrink: 0,
                  }}>
                    <Fingerprint size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                      Two-Factor Authentication
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: '2px 0 0' }}>
                      Require MFA on every sign in
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  style={{
                    width: 44, height: 24, borderRadius: 99,
                    background: mfaEnabled ? '#3b82f6' : '#cbd5e1',
                    display: 'flex', alignItems: 'center',
                    padding: '0 2px', cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    justifyContent: mfaEnabled ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s',
                  }} />
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Personal Info' && activeTab !== 'Security' && (
            <div style={{
              background: colors.bgCard,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              padding: 24,
              color: colors.textMuted,
              fontSize: '0.88rem'
            }}>
              {activeTab} tab content coming soon.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
