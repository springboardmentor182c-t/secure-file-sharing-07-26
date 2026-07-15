import React from 'react';

export default function Checkbox({ label, checked, onChange, id, name }) {
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px', userSelect: 'none' }}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          accentColor: 'var(--color-primary)',
          cursor: 'pointer'
        }}
      />
      <span style={{ fontSize: '0.95rem', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', textDecoration: checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
        {label}
      </span>
    </label>
  );
}
