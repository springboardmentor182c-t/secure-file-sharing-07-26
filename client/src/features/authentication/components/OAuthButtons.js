import React from "react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.9a9 9 0 0 0 0 8.08l3.05-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .9 4.96l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function OAuthButtons({ onSelect, disabled }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("google")}
        className="flex items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-[#24252f] py-2.5 text-sm font-medium text-white transition hover:bg-[#2c2d38] disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("microsoft")}
        className="flex items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-[#24252f] py-2.5 text-sm font-medium text-white transition hover:bg-[#2c2d38] disabled:opacity-50"
      >
        <MicrosoftIcon />
        Continue with Microsoft
      </button>
    </div>
  );
}