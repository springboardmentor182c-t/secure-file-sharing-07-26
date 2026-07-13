import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Parse token from query parameter ?token=...
  const query = new URLSearchParams(location.search);
  const token = query.get('token') || '';

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'var(--rose-500)', 'var(--amber-500)', 'var(--blue-500)', 'var(--emerald-500)'][strength];

  const validateForm = () => {
    const errors = {};
    if (!form.password) {
      errors.password = 'Password is required';
    } else {
      if (form.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(form.password)) {
        errors.password = (errors.password ? errors.password + '. ' : '') + 'Must contain at least one uppercase letter';
      }
      if (!/[0-9]/.test(form.password)) {
        errors.password = (errors.password ? errors.password + '. ' : '') + 'Must contain at least one number';
      }
      if (!/[^A-Za-z0-9]/.test(form.password)) {
        errors.password = (errors.password ? errors.password + '. ' : '') + 'Must contain at least one special character';
      }
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050c1a', padding: '20px' }}>
      <div style={{ background: '#0a162b', border: '1px solid #1e293b', borderRadius: '16px', padding: '40px', maxWidth: '440px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} className="fade-in">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>Reset Your Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginBottom: '24px', lineHeight: 1.6, textAlign: 'center' }}>
          Enter a strong, secure new password below to update your account.
        </p>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '16px', color: 'var(--emerald-400)', fontSize: '.875rem', marginBottom: '24px', lineHeight: 1.6 }}>
              ✓ Password reset successfully! Redirecting you to login...
            </div>
            <Link to="/login" className="btn btn-primary w-full btn-lg" style={{ display: 'block', textDecoration: 'none', padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: 600 }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">New Password</label>
              <div className="input-wrap">
                <span className="input-icon-l">🔒</span>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter new strong password"
                  value={form.password}
                  onChange={e => {
                    setForm(f => ({ ...f, password: e.target.value }));
                    setFieldErrors(f => ({ ...f, password: '' }));
                  }}
                  required
                />
                <span className="input-icon-r" onClick={() => setShowPw(v => !v)} style={{ cursor: 'pointer' }}>
                  {showPw ? '🙈' : '👁️'}
                </span>
              </div>
              {fieldErrors.password && <div style={{ color: 'var(--rose-500)', fontSize: '.75rem', marginTop: 4 }}>{fieldErrors.password}</div>}
              {form.password && (
                <div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= strength ? strengthColor : 'var(--bg-input)', transition: 'background .3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '.75rem', color: strengthColor, marginTop: 4 }}>{strengthLabel}</div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm New Password</label>
              <div className="input-wrap">
                <span className="input-icon-l">🔒</span>
                <input
                  className="form-input"
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={e => {
                    setForm(f => ({ ...f, confirmPassword: e.target.value }));
                    setFieldErrors(f => ({ ...f, confirmPassword: '' }));
                  }}
                  required
                />
                <span className="input-icon-r" onClick={() => setShowConfirmPw(v => !v)} style={{ cursor: 'pointer' }}>
                  {showConfirmPw ? '🙈' : '👁️'}
                </span>
              </div>
              {fieldErrors.confirmPassword && <div style={{ color: 'var(--rose-500)', fontSize: '.75rem', marginTop: 4 }}>{fieldErrors.confirmPassword}</div>}
            </div>

            {error && <div style={{ color: 'var(--rose-500)', fontSize: '.875rem', marginBottom: '16px' }}>⚠️ {error}</div>}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Resetting…' : '🔐 Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
