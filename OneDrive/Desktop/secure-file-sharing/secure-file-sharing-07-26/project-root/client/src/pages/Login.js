import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./Login.css";
import {
  FaGoogle,
  FaMicrosoft,
  FaGithub,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const BACKEND = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await login(email, password);
      if (res.mfaRequired) {
        navigate("/verify-2fa", { state: { mfaToken: res.mfaToken } });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-circles">
        <span></span><span></span><span></span><span></span>
      </div>

      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">🛡️</div>
          <h2>SecureShare</h2>
        </div>

        <h1>Welcome back</h1>
        <p>Sign in to your SecureShare account</p>

        <div className="social-buttons">
          <a href={`${BACKEND}/api/auth/oauth/google`}><button type="button"><FaGoogle /> Google</button></a>
          <a href={`${BACKEND}/api/auth/oauth/microsoft`}><button type="button"><FaMicrosoft /> Microsoft</button></a>
          <a href={`${BACKEND}/api/auth/oauth/github`}><button type="button"><FaGithub /> GitHub</button></a>
        </div>

        <div className="divider"><span>or continue with email</span></div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <div className="input-box">
              <FaEnvelope />
              <input
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-box">
              <FaLock />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "8px 0" }}>{error}</p>}

          <button className="signin-btn" type="submit" disabled={busy}>
            <FaArrowRight />
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up free</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
