import React, { useState, useRef, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "./FAVerification.css";
import { FaShieldAlt as ShieldCheck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const FAVerification = () => {
  const { verifyMfa } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mfaToken = location.state?.mfaToken;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // No mfa_token → user landed here directly. Bounce to login.
  if (!mfaToken) return <Navigate to="/login" replace />;

  const submit = async (code) => {
    setError("");
    setBusy(true);
    try {
      await verifyMfa(mfaToken, code);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < otp.length - 1) inputRefs.current[index + 1]?.focus();
    const code = newOtp.join("");
    if (code.length === 6) submit(code);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    submit(code);
  };

  return (
    <div className="verify-page">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>

      <div className="verify-card">
        <div className="logo-section">
          <div className="logo-icon"><ShieldCheck size={26} /></div>{/* ponytail: react-icons swap for lucide-react (no new dep) */}
          <h1>SecureShare</h1>
        </div>

        <h2>Two-factor authentication</h2>
        <p className="subtitle">Enter the 6-digit code from your authenticator app</p>

        <div className="otp-wrapper">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className="otp-input"
              disabled={busy}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10 }}>{error}</p>}

        <button className="verify-btn" onClick={handleVerify} disabled={busy}>
          {busy ? "Verifying…" : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default FAVerification;
