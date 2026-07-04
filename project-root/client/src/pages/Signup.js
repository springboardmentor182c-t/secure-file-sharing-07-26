import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-mark" style={{ width: 36, height: 36 }}>🔐</div>
          <span className="logo-name" style={{ fontSize: '1.25rem' }}>TrustShare</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>🚀</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Start Secure Sharing</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.7 }}>
            Join 50,000+ teams using TrustShare for encrypted, compliant file sharing.
          </p>
          <div className="grid-2" style={{ marginTop: 32, gap: 12 }}>
            {[['10M+', 'Files Secured'], ['99.99%', 'Uptime SLA'], ['AES-256', 'Encryption'], ['SOC 2', 'Compliant']].map(([v, l]) => (
              <div key={l} className="card card-pad" style={{ textAlign: 'center', padding: '14px' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--blue-400)' }}>{v}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-wrap fade-in">
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">Secure file sharing for your team</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <span className="input-icon-l">👤</span>
                <input className="form-input" type="text" placeholder="Surya"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div className="input-wrap">
                <span className="input-icon-l">✉️</span>
                <input className="form-input" type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon-l">🔒</span>
                <input className="form-input" type="password" placeholder="Create a strong password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
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

            {error && <div className="form-error mb-3">⚠️ {error}</div>}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm animate-spin" /> Creating account…</> : '🚀 Create Secure Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
