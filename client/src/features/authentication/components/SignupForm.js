import React, { useState } from "react";
import { Lock } from "lucide-react";
import { InputField } from "../../../components/Form/InputField";
import { OAuthButtons } from "../../../components/Buttons/OAuthButtons";
import { PrimaryButton } from "../../../components/Buttons";
import { useAuth } from "../../../context/AuthContext";
import { registerUser } from "../services/authService";
import { PASSWORD_MIN_LENGTH } from "../../../data/constants";

export function SignupForm() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(name, email, password);
      // Auto sign-in right after registration for a smooth first-run experience
      await login(email, password);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <OAuthButtons />
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Chen" required />
        <InputField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`Min. ${PASSWORD_MIN_LENGTH} characters`}
          required
          minLength={PASSWORD_MIN_LENGTH}
        />
        <div className="p-3 rounded-lg bg-[#212531]/60 flex items-start gap-2">
          <Lock size={12} className="text-[#B7A2C9] mt-0.5 shrink-0" />
          <p className="text-[#C5C3C4]/60 text-[11px] leading-relaxed">
            Your files will be AES-256 encrypted at rest. JWT tokens secure your session.
          </p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <PrimaryButton type="submit" loading={submitting} loadingText="Creating account...">
          Create account
        </PrimaryButton>
      </form>
    </>
  );
}
