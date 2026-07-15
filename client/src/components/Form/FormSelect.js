import React from 'react';

export default function FormSelect({ label, value, onChange, options = [], name, id, required = false }) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          cursor: 'pointer'
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
