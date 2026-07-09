import React, { useState } from "react";
import { InputField } from "../../../components/Form/InputField";
import { OAuthButtons } from "../../../components/Buttons/OAuthButtons";
import { PrimaryButton } from "../../../components/Buttons";
import { useAuth } from "../../../context/AuthContext";

export function LoginForm({ onForgotPassword, onMfaRequired }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired && result.mfaToken) {
        onMfaRequired(result.mfaToken);
      }
      // Non-MFA success updates `user` in AuthContext; the router redirects.
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
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          extra={
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-[#B7A2C9] hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          }
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <PrimaryButton type="submit" loading={submitting} loadingText="Signing in...">
          Sign in with email
        </PrimaryButton>
      </form>
    </>
  );
}
