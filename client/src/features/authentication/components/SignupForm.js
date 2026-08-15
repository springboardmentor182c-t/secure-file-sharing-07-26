import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import OAuthButtons from "./OAuthButtons";
import { useSignup } from "../hooks/useSignup";
import { loginWithOAuth } from "../services/login";

export default function SignupForm() {
  const { submit, loading, error } = useSignup();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) return setFormError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setFormError("Please enter a valid email address.");
    if (password.length < 8) return setFormError("Password must be at least 8 characters.");

    await submit({ fullName: fullName.trim(), email: email.trim(), password });
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-white/50">Start sharing securely today</p>
      </div>

      <OAuthButtons onSelect={loginWithOAuth} disabled={loading} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/40">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/70">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Chen"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#7C5CFC]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/70">Work email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#7C5CFC]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#7C5CFC]"
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-white/5 p-3 text-xs text-white/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
          </svg>
          <span>Your files will be AES-256 encrypted at rest. JWT tokens secure your session.</span>
        </div>

        {(formError || error) && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError || error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-lg bg-[#7C5CFC] py-2.5 text-sm font-medium text-white transition hover:bg-[#6d4ce0] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#a78bfa] hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}