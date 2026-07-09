import React from "react";

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-[380px] bg-[#322F42] rounded-2xl p-6 border border-[#B7A2C9]/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#C5C3C4]/60 hover:text-white text-sm">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
