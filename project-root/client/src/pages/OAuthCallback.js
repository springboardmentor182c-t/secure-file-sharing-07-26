import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

export default function OAuthCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const accessToken = query.get('access_token');
    const refreshToken = query.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setError('OAuth login failed: tokens were not returned. Please try again.');
      return;
    }

    const finishLogin = async () => {
      try {
        // Store the tokens (OAuth always uses localStorage — remember-me is implicit)
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Fetch the logged-in user's profile to populate AuthContext
        const { data } = await authAPI.me();
        setUser(data);

        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError('Failed to retrieve user profile. Please try signing in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    };

    finishLogin();
  }, [location, setUser, navigate]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#050c1a', padding: '20px'
    }}>
      <div style={{
        background: '#0a162b', border: '1px solid #1e293b', borderRadius: '16px',
        padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        {error ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              Authentication Error
            </h2>
            <p style={{ color: 'var(--rose-500)', fontSize: '.875rem', marginBottom: '24px', lineHeight: 1.6 }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full"
              style={{ padding: '12px', borderRadius: '8px' }}
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div style={{
              margin: '0 auto 24px auto', width: '40px', height: '40px',
              border: '3px solid rgba(59,130,246,0.2)', borderTopColor: 'var(--primary)',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Completing login…
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>
              Verifying credentials and setting up your session.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
