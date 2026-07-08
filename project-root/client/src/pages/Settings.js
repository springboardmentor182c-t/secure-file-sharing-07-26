import React, { useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '../data/constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [theme, setTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.THEME, 'dark');
  const [notifications, setNotifications] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    try {
      const { data } = await authAPI.updateProfile({ mfa_enabled: mfaEnabled });
      setUser(prev => ({ ...prev, mfa_enabled: data.mfa_enabled }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Settings ⚙️</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage your application preferences.</p>

      {error && <div className="form-error mb-3" style={{ color: 'var(--rose-500)', marginBottom: '12px' }}>⚠️ {error}</div>}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Appearance</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500 }}>Theme</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Choose your preferred colour scheme</p>
          </div>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Notifications</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500 }}>Email Notifications</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Receive important updates via email</p>
          </div>
          <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Security</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500 }}>Multi-Factor Authentication (MFA)</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Require a 6-digit OTP code when logging in</p>
          </div>
          <input type="checkbox" checked={mfaEnabled} onChange={(e) => setMfaEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
        </div>
      </div>

      <button onClick={handleSave} style={{ padding: '12px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
};

export default Settings;
