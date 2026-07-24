import type { ReactNode, InputHTMLAttributes } from "react";
import { Shield } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#212531] flex flex-col items-center justify-center p-8"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
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

export function InputField({
  label,
  extra,
  error,
  ...props
}: {
  label: string;
  extra?: ReactNode;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-[#C5C3C4]/80 font-medium">{label}</label>
        {extra}
      </div>
      <input
        {...props}
        className={`w-full px-3.5 py-2.5 bg-[#212531] border rounded-lg text-sm text-white placeholder:text-[#C5C3C4]/30 focus:outline-none transition-colors ${
          error
            ? "border-red-500/60 focus:border-red-500"
            : "border-[#B7A2C9]/15 focus:border-[#4B3A70]/60"
        }`}
      />
      {error && <p className="text-red-400 text-[11px] mt-1.5">{error}</p>}
    </div>
  );
}

export function OAuthButtons() {
  return (
    <div className="space-y-2 mb-5">
      {[
        { label: "Continue with Google", icon: "G", color: "#EA4335" },
        { label: "Continue with Microsoft", icon: "M", color: "#00A4EF" },
      ].map(({ label, icon, color }) => (
        <button
          key={label}
          type="button"
          disabled
          title="OAuth sign-in is not configured in this build"
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-sm text-[#C5C3C4]/40 cursor-not-allowed"
        >
          <span
            className="w-5 h-5 rounded text-white text-xs font-bold flex items-center justify-center shrink-0 opacity-50"
            style={{ background: color }}
          >
            {icon}
          </span>
          {label}
        </button>
      ))}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#B7A2C9]/10" />
        <span className="text-[#C5C3C4]/40 text-xs">or</span>
        <div className="flex-1 h-px bg-[#B7A2C9]/10" />
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed">
      {message}
    </div>
  );
}
