import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Lock } from "lucide-react";
import { AuthShell, InputField, OAuthButtons, ErrorBanner } from "./AuthShared";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export default function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (name.trim().length < 3) errors.name = "Enter your full name (min. 3 characters)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.password = "Password must contain at least one letter and one number";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // "Full name" doubles as the username the backend expects: slugify it into
  // something that satisfies a typical username constraint.
  function deriveUsername(fullName: string): string {
    const base = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
    return base.length >= 3 ? base.slice(0, 40) : `${base}user`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup(deriveUsername(name), email, password);
      navigate("/app");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start sharing securely today"
      footer={
        <>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-[#B7A2C9] hover:text-white transition-colors"
          >
            Sign in
          </button>
        </>
      }
    >
      <OAuthButtons />
      <ErrorBanner message={formError} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Full name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Chen"
          error={fieldErrors.name}
          autoComplete="name"
        />
        <InputField
          label="Work email"
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
          placeholder="Min. 8 characters"
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        <div className="p-3 rounded-lg bg-[#212531]/60 flex items-start gap-2">
          <Lock size={12} className="text-[#B7A2C9] mt-0.5 shrink-0" />
          <p className="text-[#C5C3C4]/60 text-[11px] leading-relaxed">
            Your files will be AES-256 encrypted at rest. JWT tokens secure your session.
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors mt-1"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
