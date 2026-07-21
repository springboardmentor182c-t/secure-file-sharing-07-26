import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid email or password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-circles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">🛡️</div>
          <h2>SecureShare</h2>
        </div>

        <h1>Welcome back</h1>
        <p>Sign in to your SecureShare account</p>

        <div className="social-buttons">
          <button>
            <FaGoogle /> Google
          </button>

          <button>
            <FaMicrosoft /> Microsoft
          </button>

          <button>
            <FaGithub /> GitHub
          </button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

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
              />
            </div>
          </div>

          <div className="options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="signin-btn" type="submit" disabled={submitting}>
            <FaArrowRight />
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account?
          <Link to="/signup"> Sign up free</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
