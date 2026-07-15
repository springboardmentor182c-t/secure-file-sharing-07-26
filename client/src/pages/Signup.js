import React from 'react';
import SignupForm from '../features/authentication/components/SignupForm';
import { CheckSquare } from 'lucide-react';

export default function Signup() {
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)' }}>Create Account</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Register as a Springboard intern to get started
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
