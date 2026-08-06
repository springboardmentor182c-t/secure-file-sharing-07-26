import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal component — theme-aware design (dark / light)
 * @param {boolean} isOpen   - Controls visibility
 * @param {function} onClose - Close handler
 * @param {string}  title    - Modal title
 * @param {string}  subtitle - Optional subtitle
 * @param {React.ReactNode} icon - Optional icon element displayed above title
 * @param {React.ReactNode} children - Modal body content
 * @param {string}  size     - 'sm' | 'md' | 'lg'
 * @param {boolean} isDark   - Drives dark/light colour palette
 */
const Modal = ({ isOpen, onClose, title = '', subtitle = '', icon = null, children, size = 'md', isDark = true }) => {
  const sizeMap = { sm: '420px', md: '560px', lg: '800px' };
  const contentRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Colour tokens ────────────────────────────────────────────────
  const c = {
    overlay:     isDark ? 'rgba(0,0,0,0.65)'              : 'rgba(15,23,42,0.45)',
    panelBg:     isDark
      ? 'linear-gradient(145deg, #161b27 0%, #0f1520 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    panelBorder: isDark ? 'rgba(255,255,255,0.1)'         : 'rgba(0,0,0,0.08)',
    topGlow:     isDark
      ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)',
    shadow:      isDark
      ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)'
      : '0 24px 60px rgba(15,23,42,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
    headerBorder:isDark ? 'rgba(255,255,255,0.07)'        : 'rgba(0,0,0,0.07)',
    title:       isDark ? '#f1f5f9'                       : '#0f172a',
    subtitle:    isDark ? '#64748b'                       : '#64748b',
    closeBg:     isDark ? 'rgba(255,255,255,0.06)'        : 'rgba(0,0,0,0.05)',
    closeBorder: isDark ? 'rgba(255,255,255,0.08)'        : 'rgba(0,0,0,0.08)',
    closeColor:  isDark ? '#64748b'                       : '#94a3b8',
    iconBg:      isDark
      ? 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.18) 100%)'
      : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
    iconBorder:  isDark ? 'rgba(99,102,241,0.3)'          : 'rgba(99,102,241,0.2)',
  };

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: c.overlay,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        animation: 'modalFadeIn 0.2s ease',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.panelBg,
          borderRadius: '18px',
          border: `1px solid ${c.panelBorder}`,
          width: '90%', maxWidth: sizeMap[size],
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: c.shadow,
          animation: 'modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top glow accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '60%', height: 1,
          background: c.topGlow,
          borderRadius: '0 0 50% 50%',
          pointerEvents: 'none',
        }} />

        {/* ── Header ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          padding: '32px 28px 20px',
          borderBottom: `1px solid ${c.headerBorder}`,
        }}>
          {/* Icon badge */}
          {icon && (
            <div style={{
              width: 56, height: 56, borderRadius: '16px',
              background: c.iconBg,
              border: `1px solid ${c.iconBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              boxShadow: isDark
                ? '0 8px 24px rgba(99,102,241,0.15)'
                : '0 4px 16px rgba(99,102,241,0.12)',
            }}>
              {icon}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h2 style={{
                fontSize: '1.15rem', fontWeight: 700,
                color: c.title, margin: 0, letterSpacing: '-0.01em',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              }}>{title}</h2>
              {subtitle && (
                <p style={{
                  color: c.subtitle, fontSize: '0.82rem', margin: '4px 0 0', lineHeight: 1.5,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: c.closeBg,
                border: `1px solid ${c.closeBorder}`,
                color: c.closeColor,
                fontSize: '13px', cursor: 'pointer',
                width: 30, height: 30, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1, flexShrink: 0, marginLeft: 12, marginTop: 2,
                transition: 'background 0.15s, color 0.15s',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)';
                e.currentTarget.style.color = isDark ? '#f1f5f9' : '#0f172a';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = c.closeBg;
                e.currentTarget.style.color = c.closeColor;
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '24px 28px 28px' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideUp {
          from { transform: translateY(24px) scale(0.96); opacity: 0 }
          to   { transform: translateY(0)    scale(1);    opacity: 1 }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Modal;
