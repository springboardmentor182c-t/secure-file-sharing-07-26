import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Smartphone } from "lucide-react";
import { AuthShell, ErrorBanner } from "./AuthShared";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export default function MFAVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyMfa } = useAuth();

  const mfaToken = (location.state as { mfaToken?: string } | null)?.mfaToken;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // A user can't land here directly (e.g. by bookmarking the URL) without
  // having just passed the password step.
  useEffect(() => {
    if (!mfaToken) navigate("/signin", { replace: true });
  }, [mfaToken, navigate]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  async function handleVerify() {
    if (!mfaToken) return;
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setFormError("Enter the full 6-digit code.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await verifyMfa(mfaToken, fullCode);
      navigate("/app");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Invalid authentication code."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app"
    >
      <div className="mb-6 p-4 rounded-xl bg-[#4B3A70]/20 border border-[#4B3A70]/30 flex items-start gap-3">
        <Smartphone size={15} className="text-[#B7A2C9] mt-0.5 shrink-0" />
        <p className="text-[#C5C3C4]/80 text-xs leading-relaxed">
          Open your authenticator app (Google Authenticator, Authy, or similar) and enter the
          6-digit code shown.
        </p>
      </div>
      <ErrorBanner message={formError} />
      <div className="flex gap-2 justify-center mb-6">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-12 bg-[#212531] border border-[#B7A2C9]/20 rounded-lg text-center text-white text-lg font-bold focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
          />
        ))}
      </div>
      <button
        onClick={handleVerify}
        disabled={submitting}
        className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors mb-3"
      >
        {submitting ? "Verifying…" : "Verify code"}
      </button>
      <button
        onClick={() => navigate("/signin")}
        className="w-full py-2.5 border border-[#B7A2C9]/20 text-[#C5C3C4] hover:border-[#B7A2C9]/40 rounded-lg text-sm transition-colors"
      >
        ← Back to sign in
      </button>
    </AuthShell>
  );
}
