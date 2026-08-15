import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useMfa } from "../hooks/useMfa";

export default function MfaForm() {
  const { submitCode, submitRecoveryCode, loading, error } = useMfa();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const inputsRef = useRef([]);

  const handleDigitChange = (index, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (useRecovery) {
      if (!recoveryCode.trim()) return;
      await submitRecoveryCode(recoveryCode.trim());
    } else {
      const code = digits.join("");
      if (code.length !== 6) return;
      await submitCode(code);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white">Two-factor authentication</h1>
        <p className="mt-1 text-sm text-white/50">Enter the 6-digit code from your authenticator app</p>
      </div>

      {!useRecovery && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-white/5 p-3 text-xs text-white/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>Open your authenticator app (Google Authenticator, Authy, or similar) and enter the 6-digit code shown.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {useRecovery ? (
          <input
            type="text"
            autoFocus
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="Enter recovery code"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f14] px-3 py-2.5 text-center text-sm tracking-wide text-white placeholder-white/30 outline-none focus:border-[#7C5CFC]"
          />
        ) : (
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-11 rounded-lg border border-white/10 bg-[#0f0f14] text-center text-lg text-white outline-none focus:border-[#7C5CFC]"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#7C5CFC] py-2.5 text-sm font-medium text-white transition hover:bg-[#6d4ce0] disabled:opacity-60"
        >
          {loading ? "Verifying…" : useRecovery ? "Use recovery code" : "Verify code"}
        </button>

        <Link
          to="/login"
          className="w-full rounded-lg border border-white/10 py-2.5 text-center text-sm font-medium text-white/80 transition hover:bg-white/5"
        >
          ← Back to sign in
        </Link>

        <button
          type="button"
          onClick={() => setUseRecovery((v) => !v)}
          className="text-center text-xs text-white/40"
        >
          {useRecovery ? (
            "Use your authenticator code instead"
          ) : (
            <>Lost access? <span className="text-[#a78bfa] hover:underline">Use a recovery code</span></>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}