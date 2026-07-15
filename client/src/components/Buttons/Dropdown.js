import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({ label, options = [], onSelect, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {selectedOption ? selectedOption.label : label}
        <span style={{ fontSize: '0.65rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 100,
            marginTop: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '160px',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: opt.value === value ? 'var(--color-primary-glow)' : 'transparent',
                border: 'none',
                color: opt.value === value ? 'var(--color-primary)' : 'var(--text-primary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.target.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
