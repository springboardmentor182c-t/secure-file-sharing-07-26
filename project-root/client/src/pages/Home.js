import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../data/constants';

const Home = () => {
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>Welcome Home 🏠</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '32px' }}>
        This is your React + FastAPI starter application.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { icon: '🔐', title: 'Authentication', desc: 'Login & Signup flows ready.', link: ROUTES.LOGIN },
          { icon: '⚙️', title: 'Settings', desc: 'Manage your preferences.', link: ROUTES.SETTINGS },
          { icon: '📦', title: 'Components', desc: 'Reusable UI components.', link: ROUTES.HOME },
        ].map((card) => (
          <Link to={card.link} key={card.title} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{card.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
