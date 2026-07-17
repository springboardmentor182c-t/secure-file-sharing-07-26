import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left branding */}
      <div className="auth-panel-left">
        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-mark" style={{ width: 36, height: 36 }}>🔐</div>
          <span className="logo-name" style={{ fontSize: '1.25rem' }}>TrustShare</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>🔐</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Zero-Trust Security</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.7 }}>
            Every file encrypted. Every access logged. Every user verified with AES-256.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
            {['AES-256 end-to-end encryption', 'Multi-factor authentication', 'Granular permission controls', 'Full audit trail & compliance'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,.2)', border: '1px solid rgba(16,185,129,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-400)', fontSize: '.6875rem', flexShrink: 0 }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-panel-right">
        <div className="auth-form-wrap fade-in">
          <div className="auth-title">Welcome back</div>
          <div className="auth-subtitle">Sign in to your TrustShare account</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon-l">✉️</span>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <span className="auth-link" style={{ fontSize: '.75rem' }}>Forgot password?</span>
              </label>
              <div className="input-wrap">
                <span className="input-icon-l">🔒</span>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <span className="input-icon-r" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {error && <div className="form-error mb-3">⚠️ {error}</div>}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm animate-spin" /> Signing in…</> : '🔐 Sign In Securely'}
            </button>
          </form>

          <div className="divider">or continue with</div>
          <div className="grid-3" style={{ gap: 10 }}>
            {[['🌐', 'Google'], ['🪟', 'Microsoft'], ['🐙', 'GitHub']].map(([icon, name]) => (
              <button key={name} className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: '.8125rem' }}>
                {icon} {name}
              </button>
            ))}
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup" className="auth-link">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
