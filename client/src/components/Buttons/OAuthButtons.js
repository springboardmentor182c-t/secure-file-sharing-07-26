import React from "react";
import { oauthLoginUrl } from "../../features/authentication/services/authService";
import { OAUTH_PROVIDERS } from "../../data/constants";

const PROVIDERS = [
  { label: "Continue with Google", icon: "G", color: "#EA4335", provider: OAUTH_PROVIDERS.GOOGLE },
  { label: "Continue with Microsoft", icon: "M", color: "#00A4EF", provider: OAUTH_PROVIDERS.MICROSOFT },
];

export function OAuthButtons() {
  const startOAuth = (provider) => {
    // Full page redirect into the FastAPI authorization-code flow.
    window.location.href = oauthLoginUrl(provider);
  };

  return (
    <div className="space-y-2 mb-5">
      {PROVIDERS.map(({ label, icon, color, provider }) => (
        <button
          key={provider}
          type="button"
          onClick={() => startOAuth(provider)}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-sm text-[#C5C3C4] hover:border-[#B7A2C9]/30 hover:text-white transition-colors"
        >
          <span
            className="w-5 h-5 rounded text-white text-xs font-bold flex items-center justify-center shrink-0"
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
