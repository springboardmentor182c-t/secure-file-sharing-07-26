import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { authAPI } from "../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // step 1 = enter email, step 2 = enter new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      const { data } = await authAPI.forgotPassword(email);
      // No mail server in local dev — the API returns the reset token directly.
      setResetToken(data.reset_token);
      setInfo("Account found. Enter a new password below.");
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not process request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not reset password"
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

        <h1>Reset password</h1>
        <p>
          {step === 1
            ? "Enter your account email to continue"
            : "Choose a new password for your account"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequest}>
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

            {error && <p className="login-error">{error}</p>}

            <button className="signin-btn" type="submit" disabled={submitting}>
              <FaArrowRight />
              {submitting ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            {info && (
              <p className="login-error" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}>
                {info}
              </p>
            )}

            <div className="input-group">
              <label>New Password</label>
              <div className="input-box">
                <FaLock />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-box">
                <FaLock />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button className="signin-btn" type="submit" disabled={submitting}>
              <FaArrowRight />
              {submitting ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="signup-link">
          Remembered your password?
          <Link to="/login"> Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
