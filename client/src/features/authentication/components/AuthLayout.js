import React from "react";

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C5CFC]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </div>
      <span className="text-[15px] font-semibold text-white">TrustShare</span>
    </div>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f0f14] px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6">
        <LogoMark />
        <div className="w-full rounded-2xl border border-white/10 bg-[#181926] p-8 shadow-xl shadow-black/30">
          {children}
        </div>
      </div>
    </div>
  );
}