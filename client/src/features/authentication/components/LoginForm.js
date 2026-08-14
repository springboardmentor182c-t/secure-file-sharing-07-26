import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import OAuthButtons from "./OAuthButtons";
import { useLogin } from "../hooks/useLogin";
import { loginWithOAuth } from "../services/login";

export default function LoginForm() {
  const { submit, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password) return setFormError("Please enter your email and password.");
    await submit({ email: email.trim(), password });
  };

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">Sign in to your TrustShare account</p>
      </div>

      <OAuthButtons onSelect={loginWithOAuth} disabled={loading} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/40">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/70">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#7C5CFC]"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-white/70">Password</label>
            <Link to="/forgot-password" className="text-xs text-[#a78bfa] hover:underline">Forgot password?</Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f14] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#7C5CFC]"
          />
        </div>

        {(formError || error) && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError || error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-lg bg-[#7C5CFC] py-2.5 text-sm font-medium text-white transition hover:bg-[#6d4ce0] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in with email"}
        </button>

        <p className="text-center text-xs text-white/50">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-[#a78bfa] hover:underline">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}