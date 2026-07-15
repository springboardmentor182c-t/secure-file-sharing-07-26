import React from 'react';

export default function RadioButton({ label, name, value, checked, onChange, id }) {
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px', userSelect: 'none' }}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--color-primary)',
          cursor: 'pointer'
        }}
      />
      <span style={{ fontSize: '0.9rem', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {label}
      </span>
    </label>
  );
}
