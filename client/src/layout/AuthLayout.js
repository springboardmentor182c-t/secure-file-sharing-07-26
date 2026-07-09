import React from "react";
import { Shield } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[#212531] flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#4B3A70] flex items-center justify-center">
          <Shield size={15} className="text-white" />
        </div>
        <span className="text-white font-semibold text-base tracking-tight">TrustShare</span>
      </div>
      <div className="w-full max-w-[380px] bg-[#322F42] rounded-2xl p-7 border border-[#B7A2C9]/10">
        <h2 className="text-white text-xl font-semibold mb-1 tracking-tight">{title}</h2>
        <p className="text-[#C5C3C4]/70 text-sm mb-6">{subtitle}</p>
        {children}
        {footer && <div className="mt-5 text-center text-xs text-[#C5C3C4]/50">{footer}</div>}
      </div>
    </div>
  );
}
