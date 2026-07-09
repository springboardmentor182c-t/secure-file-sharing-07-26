import React from "react";

export function PrimaryButton({ children, disabled, loadingText, loading, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
      {...props}
    >
      {loading ? loadingText || "Loading..." : children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button
      className="w-full py-2.5 border border-[#B7A2C9]/20 text-[#C5C3C4] hover:border-[#B7A2C9]/40 rounded-lg text-sm transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}
