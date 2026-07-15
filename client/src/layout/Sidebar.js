import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Files } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';

export default function Sidebar() {
  const { isAuthenticated } = useAnalytics();

  if (!isAuthenticated) return null;

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
    background: isActive ? 'var(--color-primary-glow)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.95rem',
    transition: 'all var(--transition-fast)'
  });

  return (
    <aside
      style={{
        width: '240px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 70px)',
        position: 'sticky',
        top: '70px',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '16px', marginBottom: '8px' }}>
          Navigation
        </span>
        

        <NavLink to="/files" style={linkStyle}>
          <Files size={18} />
          <span>Files</span>
        </NavLink>
        
        <NavLink to="/settings" style={linkStyle}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>

    </aside>

  );
}
