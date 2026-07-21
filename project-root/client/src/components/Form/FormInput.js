import React from 'react';

/**
 * FormInput – a reusable input field with optional label.
 *
 * Props:
 *   id          – unique identifier for the input.
 *   label       – optional text displayed above the input.
 *   type        – input type (text, email, password, number, etc.).
 *   value       – controlled value.
 *   onChange    – handler called with the new value.
 *   placeholder – placeholder text.
 *   disabled    – disables the input when true.
 *   className   – additional CSS classes for the wrapper.
 */
export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
      />
    </div>
  );
}
