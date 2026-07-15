import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAnalytics } from '../../../context/AnalyticsContext';
import { loginService } from '../services/login';
import FormInput from '../../../components/Form/FormInput';
import ButtonGroup from '../../../components/Buttons/ButtonGroup';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAnalytics();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginService(email, password);
      loginUser(data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            marginBottom: '10px'
          }}
        >
          {error}
        </div>
      )}

      <FormInput
        label="Email Address"
        type="email"
        id="login-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <FormInput
        label="Password"
        type="password"
        id="login-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <ButtonGroup align="center">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '8px' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </ButtonGroup>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Create an Account
        </Link>
      </div>
    </form>
  );
}
