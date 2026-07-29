import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell } from 'lucide-react';

/** Reads the current theme from the <html> class and listens for changes. */
function useTheme() {
  const [isLight, setIsLight] = useState(
    () => document.documentElement.classList.contains('light')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isLight;
}

export default function Navbar({ unreadCount = 0 }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const isLight    = useTheme();

  const avatar = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  /* ── Theme tokens ─────────────────────────────────────── */
  const bg          = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(5,12,26,0.85)';
  const borderColor = isLight ? 'rgba(15,23,42,0.08)'    : 'rgba(255,255,255,0.05)';
  const inputBg     = isLight ? '#f1f5f9'                : 'rgba(255,255,255,0.06)';
  const inputBorder = isLight ? 'rgba(15,23,42,0.12)'    : 'rgba(255,255,255,0.08)';
  const inputColor  = isLight ? '#0f172a'                : '#f1f5f9';
  const iconColor   = isLight ? '#475569'                : '#94a3b8';
  const namColor    = isLight ? '#0f172a'                : '#f1f5f9';
  const roleColor   = isLight ? '#94a3b8'                : '#64748b';
  const hoverBg     = isLight ? 'rgba(15,23,42,0.05)'    : 'rgba(255,255,255,0.06)';
  const placeholderColor = isLight ? '#94a3b8'           : '#475569';

  return (
    <header style={{
      height: 64,
      borderBottom: `1px solid ${borderColor}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
      background: bg, backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'background 0.2s, border-color 0.2s',
    }}>

      {/* ── Search ── */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Search size={15} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)',
          color: placeholderColor, pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search files, users, logs…"
          style={{
            width: '100%', padding: '8px 12px 8px 36px',
            border: `1px solid ${inputBorder}`, borderRadius: 24,
            background: inputBg, fontSize: '0.85rem',
            color: inputColor, outline: 'none', boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          }}
        />
        <style>{`
          input::placeholder { color: ${placeholderColor}; }
        `}</style>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* ── Bell ── */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: 8, color: iconColor,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = namColor; }}
            onMouseLeave={e => { e.currentTarget.style.color = iconColor; }}
          >
            <Bell size={20} />
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 8, height: 8, borderRadius: '50%',
              background: '#3b82f6',
              border: `2px solid ${isLight ? '#fff' : '#050c1a'}`,
            }} />
          )}
        </div>

        {/* ── User ── */}
        <div
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            padding: '5px 8px 5px 6px', borderRadius: 12,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: user?.avatar_color || 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
          }}>
            {avatar}
          </div>
          <div>
            <div style={{
              fontSize: '0.82rem', fontWeight: 700,
              color: namColor, lineHeight: 1.2,
              transition: 'color 0.2s',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize: '0.7rem', color: roleColor,
              textTransform: 'capitalize',
              transition: 'color 0.2s',
            }}>
              {user?.role || 'member'}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
