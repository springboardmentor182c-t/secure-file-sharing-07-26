import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        padding: '40px 32px',
        borderRadius: 20,
        background: 'rgba(13, 27, 54, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.08)',
        backdropFilter: 'blur(16px)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 68,
          height: 68,
          margin: '0 auto 20px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60a5fa',
        }}>
          <Bell size={32} />
        </div>

        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 9999,
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          Coming Soon
        </div>

        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#f8fafc',
          marginBottom: 10,
        }}>
          Notifications
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: '#94a3b8',
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          Real-time notification feeds and security alerts are coming soon.
        </p>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 20px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} />
        </button>
      </div>
    </div>
  );
}
