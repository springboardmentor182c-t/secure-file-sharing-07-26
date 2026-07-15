import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useSignup from '../hooks/useSignup';
import useVerifyPassword from '../hooks/useVerifyPassword';
import FormInput from '../../../components/Form/FormInput';
import ButtonGroup from '../../../components/Buttons/ButtonGroup';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  
  const { signup, loading, error: signupError } = useSignup();
  const passwordFeedback = useVerifyPassword(password);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (password && !passwordFeedback.isValid) {
      setFormError('Please ensure password meets all security conditions.');
      return;
    }

    const success = await signup(email, password, fullName);
    if (success) {
      navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(signupError || formError) && (
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
          {formError || signupError}
        </div>
      )}

      <FormInput
        label="Full Name"
        type="text"
        id="signup-name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Alex Smith"
      />

      <FormInput
        label="Email Address"
        type="email"
        id="signup-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <FormInput
        label="Password"
        type="password"
        id="signup-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {/* Reactive Password Checklist */}
      {password && (
        <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Security checklist:</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: passwordFeedback.minLength ? 'var(--color-success)' : 'var(--text-muted)' }}>
              {passwordFeedback.minLength ? '✓' : '○'} At least 6 characters
            </span>
            <span style={{ color: passwordFeedback.hasNumber ? 'var(--color-success)' : 'var(--text-muted)' }}>
              {passwordFeedback.hasNumber ? '✓' : '○'} Contains a number
            </span>
          </div>
        </div>
      )}

      <ButtonGroup align="center">
        <button
          type="submit"
          disabled={loading || (password && !passwordFeedback.isValid)}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '8px' }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </ButtonGroup>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>
    </form>
  );
}
