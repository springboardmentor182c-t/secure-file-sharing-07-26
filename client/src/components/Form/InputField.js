import React from "react";

export function InputField({ label, extra, error, ...props }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-[#C5C3C4]/80 font-medium">{label}</label>
        {extra}
      </div>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-sm text-white placeholder:text-[#C5C3C4]/30 focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
