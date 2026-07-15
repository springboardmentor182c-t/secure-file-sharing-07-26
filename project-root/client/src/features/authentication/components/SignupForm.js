import React, { useState } from 'react';
import { useSignup } from '../hooks/useSignup';
import { API_BASE_URL } from '../../../data/constants';

const startOAuth = (provider) => {
  window.location.href = `${API_BASE_URL}/api/auth/oauth/${provider}`;
};

const SignupForm = ({ onSuccess }) => {
  const { signup, loading, error: signupError } = useSignup();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    const data = await signup({ name: form.name, email: form.email, password: form.password });
    if (data) onSuccess?.(data);
  };

  return (
    <div className="auth-card">
      {/* Social */}
      <div className="grid-3" style={{ gap: 10, marginBottom: 20 }}>
        {[['🌐', 'Google', 'google'], ['🪟', 'Microsoft', 'microsoft'], ['🐙', 'GitHub', 'github']].map(([icon, name, provider]) => (
          <button key={name} type="button" onClick={() => startOAuth(provider)} className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: '.8125rem' }}>
            {icon} {name}
          </button>
        ))}
      </div>

      <div className="divider">or sign up with email</div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <div className="input-wrap">
            <span className="input-icon-l">👤</span>
            <input
              id="name"
              className="form-input"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <div className="input-wrap">
            <span className="input-icon-l">✉️</span>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="alex@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-wrap">
            <span className="input-icon-l">🔒</span>
            <input
              id="password"
              className="form-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span className="input-icon-r" onClick={() => setShowPw((v) => !v)}>
              {showPw ? '🙈' : '👁️'}
            </span>
          </div>
          {form.password && (
            <div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= strength ? strengthColor : 'var(--bg-input)', transition: 'background .3s' }} />
                ))}
              </div>
              <div style={{ fontSize: '.75rem', color: strengthColor, marginTop: 4 }}>{strengthLabel}</div>
            </div>
          )}
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrap">
            <span className="input-icon-l">🔒</span>
            <input
              id="confirmPassword"
              className="form-input"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <span className="input-icon-r" onClick={() => setShowConfirm((v) => !v)}>
              {showConfirm ? '🙈' : '👁️'}
            </span>
          </div>
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
        </div>

        {signupError && <div className="form-error mb-3">⚠️ {signupError}</div>}

        <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
          {loading ? <><span className="spinner spinner-sm animate-spin" /> Creating account…</> : '🚀 Create Account'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
