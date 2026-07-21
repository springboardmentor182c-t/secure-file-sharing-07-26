import React from 'react';

/**
 * Checkbox – a reusable checkbox input with label.
 *
 * Props:
 *   id          – unique identifier for the input.
 *   label       – text displayed next to the checkbox.
 *   checked     – boolean indicating checked state.
 *   onChange    – handler called with the new checked value.
 *   disabled    – disables the checkbox when true.
 *   className   – additional CSS classes for the wrapper.
 */
export default function Checkbox({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = ''
}) {
  const handleChange = (e) => {
    if (onChange) onChange(e.target.checked);
  };

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`.trim()}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
}
