import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { AuthShell, InputField, OAuthButtons, ErrorBanner } from "./AuthShared";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired && result.mfaToken) {
        navigate("/mfa", { state: { mfaToken: result.mfaToken } });
      } else {
        navigate("/app");
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Incorrect email or password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your TrustShare account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-[#B7A2C9] hover:text-white transition-colors"
          >
            Sign up
          </button>
        </>
      }
    >
      <OAuthButtons />
      <ErrorBanner message={formError} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          error={fieldErrors.email}
          autoComplete="email"
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={fieldErrors.password}
          autoComplete="current-password"
          extra={
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-[#B7A2C9] hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          }
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors mt-1"
        >
          {submitting ? "Signing in…" : "Sign in with email"}
        </button>
      </form>
    </AuthShell>
  );
}
