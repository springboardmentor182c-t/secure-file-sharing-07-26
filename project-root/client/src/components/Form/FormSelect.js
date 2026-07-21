import React from 'react';

/**
 * FormSelect – a reusable select dropdown with optional label.
 *
 * Props:
 *   id          – unique identifier.
 *   label       – optional label displayed above the select.
 *   options     – array of { value, label } objects.
 *   value       – controlled selected value.
 *   onChange    – handler called with the new selected value.
 *   disabled    – disables the select when true.
 *   className   – additional CSS classes for the wrapper.
 */
export default function FormSelect({
  id,
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  className = ''
}) {
  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
