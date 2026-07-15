import React from "react";
import "./Login.css";
import {
  FaGoogle,
  FaMicrosoft,
  FaGithub,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

const Login = () => {
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

        <div className="input-group">
          <label>Email</label>
          <div className="input-box">
            <FaEnvelope />
            <input
              type="email"
              placeholder="alex@company.com"
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
            />
          </div>
        </div>

        <div className="options">
          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <a href="/">Forgot password?</a>
        </div>

        <button className="signin-btn">
          <FaArrowRight />
          Sign In
        </button>

        <div className="signup-link">
          Don't have an account?
          <a href="/"> Sign up free</a>
        </div>
      </div>
    </div>
  );
};

export default Login;