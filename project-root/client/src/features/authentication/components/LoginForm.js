import React, { useState } from "react";
import "./Login.css";
import {
  FaGoogle,
  FaMicrosoft,
  FaGithub,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login Data:", formData);

    // API call here
    // axios.post("/api/login", formData)
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="background-animation">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-circle">
            <FaShieldAlt />
          </div>
          <h1>SecureShare</h1>
        </div>

        <h2>Welcome back</h2>

        <p className="subtitle">
          Sign in to your SecureShare account
        </p>

        {/* Social Buttons */}
        <div className="social-buttons">
          <button type="button">
            <FaGoogle />
            Google
          </button>

          <button type="button">
            <FaMicrosoft />
            Microsoft
          </button>

          <button type="button">
            <FaGithub />
            GitHub
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
                name="email"
                placeholder="alex@company.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="options">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Remember me
            </label>

            <a href="/">Forgot password?</a>
          </div>

          <button className="signin-btn" type="submit">
            Sign In
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?
          <span> Sign up free</span>
        </p>
      </div>
    </div>
  );
}

export default Login;