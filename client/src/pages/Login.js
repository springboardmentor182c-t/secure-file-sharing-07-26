import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../features/authentication/components/LoginForm';
import { CheckSquare } from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 150px)' }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <CheckSquare size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Sign in to access your task dashboard
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {successMessage}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
