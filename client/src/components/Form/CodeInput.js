import React from "react";

/**
 * @param {{ value: string[], onChange: (next: string[]) => void, length?: number }} props
 */
export function CodeInput({ value, onChange, length = 6 }) {
  const handleChange = (i, digit) => {
    if (!/^\d?$/.test(digit)) return;
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < length - 1) {
      document.getElementById(`code-input-${i + 1}`)?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center mb-6">
      {value.map((digit, i) => (
        <input
          key={i}
          id={`code-input-${i}`}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          className="w-11 h-12 bg-[#212531] border border-[#B7A2C9]/20 rounded-lg text-center text-white text-lg font-bold focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
        />
      ))}
    </div>
  );
}
