import React from 'react';

export default function FormInput({ label, type = 'text', value, onChange, placeholder, name, id, required = false, error }) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
        style={error ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)' } : {}}
      />
      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
