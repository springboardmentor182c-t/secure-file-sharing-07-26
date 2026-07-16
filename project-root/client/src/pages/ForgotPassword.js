import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050c1a', padding: '20px' }}>
      <div style={{ background: '#0a162b', border: '1px solid #1e293b', borderRadius: '16px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} className="fade-in">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '24px', lineHeight: 1.6, textAlign: 'center' }}>
          Enter the email address associated with your account, and we'll email you a link to reset your password.
        </p>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '16px', color: 'var(--emerald-400)', fontSize: '.875rem', marginBottom: '24px', lineHeight: 1.6 }}>
              ✓ A password reset link has been generated. Please check your server console or logs to retrieve it.
            </div>
            <Link to="/login" className="btn btn-primary w-full btn-lg" style={{ display: 'block', textDecoration: 'none', padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: 600 }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon-l">✉️</span>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>
            </div>

            {error && <div style={{ color: 'var(--rose-500)', fontSize: '.875rem', marginBottom: '16px' }}>⚠️ {error}</div>}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Sending link…' : '✉️ Send Reset Link'}
            </button>
            
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link to="/login" className="auth-link" style={{ fontSize: '.875rem', textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
