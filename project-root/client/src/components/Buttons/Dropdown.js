import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown – a button that toggles a menu of selectable items.
 *
 * Props:
 *   label        – text or element shown on the trigger button.
 *   children     – array of <li> elements or any renderable nodes representing menu items.
 *   alignRight   – if true, aligns the menu to the right edge of the button.
 *   className    – additional CSS classes for the wrapper.
 *   buttonClass  – CSS classes for the trigger button.
 *   menuClass    – CSS classes for the dropdown menu.
 */
export default function Dropdown({
  label,
  children,
  alignRight = false,
  className = '',
  buttonClass = '',
  menuClass = ''
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggle = () => setOpen(!open);

  return (
    <div className={`relative inline-block ${className}`.trim()} ref={wrapperRef}>
      <button
        type="button"
        className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-sm rounded-md ${buttonClass}`.trim()}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <svg
          className="ml-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <ul
          className={`absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${alignRight ? 'right-0' : 'left-0'} ${menuClass}`.trim()}
          role="menu"
        >
          {React.Children.map(children, (child, idx) => (
            <li key={idx} role="none" onClick={() => setOpen(false)}>
              {React.cloneElement(child, { role: 'menuitem' })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
