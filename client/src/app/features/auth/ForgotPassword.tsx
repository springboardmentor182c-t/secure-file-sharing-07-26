import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Mail } from "lucide-react";
import { AuthShell, InputField, ErrorBanner } from "./AuthShared";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a valid email address");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const { devResetToken } = await forgotPassword(email);
      setSent(true);
      // Only ever returned by the API outside of production, to make the
      // flow testable without a real email provider wired up.
      if (devResetToken) {
        setDevResetLink(`${window.location.origin}/reset-password?token=${devResetToken}`);
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a recovery link to ${email}`}>
        <div className="flex flex-col items-center py-4 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <Mail size={24} className="text-green-400" />
          </div>
          <p className="text-[#C5C3C4]/70 text-sm text-center leading-relaxed">
            Click the link in the email to reset your password. The link expires in 15 minutes.
          </p>
          {devResetLink && (
            <div className="w-full p-3 rounded-lg bg-[#212531]/60 border border-[#B7A2C9]/10">
              <p className="text-[#C5C3C4]/50 text-[10px] mb-1.5">
                Dev mode — no email provider configured, use this link directly:
              </p>
              <a
                href={devResetLink}
                className="text-[#B7A2C9] hover:text-white text-[11px] break-all underline"
              >
                {devResetLink}
              </a>
            </div>
          )}
          <button
            onClick={() => navigate("/signin")}
            className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send a recovery link"
      footer={
        <button
          onClick={() => navigate("/signin")}
          className="text-[#B7A2C9] hover:text-white transition-colors"
        >
          ← Back to sign in
        </button>
      }
    >
      <ErrorBanner message={formError} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors mt-1"
        >
          {submitting ? "Sending…" : "Send recovery link"}
        </button>
      </form>
    </AuthShell>
  );
}
