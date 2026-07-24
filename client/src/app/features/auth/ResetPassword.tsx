import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle } from "lucide-react";
import { AuthShell, InputField, ErrorBanner } from "./AuthShared";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.password = "Password must contain at least one letter and one number";
    }
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!token) {
      setFormError("This reset link is missing its token. Request a new one.");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "This reset link is invalid or has expired."));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Password reset" subtitle="Your password has been updated">
        <div className="flex flex-col items-center py-4 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <p className="text-[#C5C3C4]/70 text-sm text-center leading-relaxed">
            You can now sign in with your new password.
          </p>
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
    <AuthShell title="Reset password" subtitle="Choose a new password for your account">
      <ErrorBanner message={formError} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        <InputField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors mt-1"
        >
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}
