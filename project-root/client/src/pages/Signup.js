import React, { useState } from "react";
import "./signup.css";
import { FaGoogle, FaGithub, FaMicrosoft } from "react-icons/fa";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Account Created Successfully!");
    console.log(formData);
  };

  return (
    <div className="signup-page">
      <div className="bg-circles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="signup-card">
        <div className="logo">
          <div className="logo-icon">🛡️</div>
          <h2>SecureShare</h2>
        </div>

        <h1>Create Account</h1>
        <p>Create your SecureShare account</p>

        <div className="social-buttons">
  <button type="button">
    <FaGoogle />
    <span>Google</span>
  </button>

  <button type="button">
    <FaMicrosoft />
    <span>Microsoft</span>
  </button>

  <button type="button">
    <FaGithub />
    <span>GitHub</span>
  </button>
</div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-box">
              <span>👤</span>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div className="input-box">
              <span>✉️</span>
              <input
                id="email"
                type="email"
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
              <span>🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-box">
              <span>🔒</span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="signup-btn">
            🚀 Create Account
          </button>
        </form>

        <div className="signin-link">
          Already have an account?
          <a href="/"> Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;