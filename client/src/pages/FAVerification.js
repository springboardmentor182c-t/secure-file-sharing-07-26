import React, { useState, useRef, useEffect } from "react";
import "./FAVerification.css";
import { ShieldCheck } from "lucide-react";

const FAVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");

    if (code.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    alert("OTP Verified Successfully!");
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);

    alert("OTP Resent!");
  };

  return (
    <div className="verify-page">
      {/* Animated Background */}
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>

      {/* Card */}
      <div className="verify-card">
        <div className="logo-section">
          <div className="logo-icon">
            <ShieldCheck size={26} />
          </div>

          <h1>SecureShare</h1>
        </div>

        <h2>Two-factor authentication</h2>

        <p className="subtitle">
          Enter the 6-digit code from your authenticator app
        </p>

        <div className="otp-wrapper">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) =>
                (inputRefs.current[index] = el)
              }
              type="text"
              maxLength={1}
              value={digit}
              className="otp-input"
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
            />
          ))}
        </div>

        <button
          className="verify-btn"
          onClick={handleVerify}
        >
          Verify
        </button>

        <div className="resend-section">
          Didn't receive a code?

          {timer > 0 ? (
            <span className="timer">
              {" "}
              {timer}s
            </span>
          ) : (
            <span
              className="resend-link"
              onClick={handleResend}
            >
              {" "}
              Resend
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAVerification;