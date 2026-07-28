import React from 'react';

/**
 * RadioButton – renders a single radio button with label.
 *
 * Props:
 *   name        – name attribute for grouping radios.
 *   value       – value of this radio item.
 *   checked     – boolean indicating if this radio is selected.
 *   onChange    – handler called with the selected value.
 *   label       – optional label displayed next to the radio.
 *   disabled    – disables the radio when true.
 *   className   – additional CSS classes for the wrapper.
 */
export default function RadioButton({
  name,
  value,
  checked = false,
  onChange,
  label,
  disabled = false,
  className = ''
}) {
  const handleChange = () => {
    if (onChange) onChange(value);
  };

  return (
    <label
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`.trim()}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="form-radio h-4 w-4 text-indigo-600 border-gray-300"
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
}
