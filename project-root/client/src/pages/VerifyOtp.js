import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

export default function VerifyOtp() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  // Parse query parameters
  const query = new URLSearchParams(location.search);
  const email = query.get('email') || '';
  const mfaToken = query.get('mfa_token') || '';
  const rememberMe = query.get('rememberMe') || 'true';

  const firstInputRef = useRef(null);

  useEffect(() => {
    // Focus first input on mount
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return; // Numbers only
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Numbers only

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIdx = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`otp-${focusIdx}`);
    if (nextInput) nextInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP(mfaToken, code);
      const storage = rememberMe === 'true' ? localStorage : sessionStorage;
      storage.setItem('access_token', data.access_token);
      storage.setItem('refresh_token', data.refresh_token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    try {
      await authAPI.resendOTP(mfaToken);
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050c1a', padding: '20px' }}>
      <div style={{ background: '#0a162b', border: '1px solid #1e293b', borderRadius: '16px', padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} className="fade-in">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Security Verification</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '24px', lineHeight: 1.6 }}>
          We have sent a 6-digit verification code to your email. Enter it below to secure your session.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                ref={index === 0 ? firstInputRef : null}
                type="text"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : null}
                style={{
                  width: '48px',
                  height: '56px',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  background: '#0d1e3d',
                  color: '#fff',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                className="otp-input"
              />
            ))}
          </div>

          {error && <div style={{ color: 'var(--rose-500)', fontSize: '.875rem', marginBottom: '16px' }}>⚠️ {error}</div>}

          <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Verifying…' : '🔐 Verify OTP'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '.875rem' }}>
          {countdown > 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>Resend code in <strong style={{ color: 'var(--blue-400)' }}>{countdown}s</strong></span>
          ) : (
            <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--blue-400)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              Resend OTP code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
