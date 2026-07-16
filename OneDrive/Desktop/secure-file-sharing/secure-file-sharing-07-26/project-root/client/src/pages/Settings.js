import React, { useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '../data/constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' };
const btn = { padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };
const input = { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', width: 140, letterSpacing: 4, textAlign: 'center' };

const Settings = () => {
  const [theme, setTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.THEME, 'dark');
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Settings ⚙️</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage your application preferences.</p>

      <div style={card}>
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

      <MfaCard />

      <div style={{ ...card, marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Notifications</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500 }}>Email Notifications</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Receive important updates via email</p>
          </div>
          <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
        </div>
      </div>

      <button onClick={handleSave} style={{ ...btn, padding: '12px 28px' }}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
};

function MfaCard() {
  const { user, setUser } = useAuth();
  const [secret, setSecret] = useState(null);
  const [uri, setUri] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  if (!user) return null;

  const beginSetup = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const { data } = await authAPI.mfaSetup();
      setSecret(data.secret);
      setUri(data.otpauth_uri);
    } catch (e) { setErr(e.response?.data?.detail || 'Failed to start setup'); }
    finally { setBusy(false); }
  };

  const enable = async () => {
    setErr(''); setBusy(true);
    try {
      await authAPI.mfaEnable(code);
      setUser({ ...user, mfa_enabled: true });
      setSecret(null); setUri(null); setCode(''); setMsg('MFA enabled');
    } catch (e) { setErr(e.response?.data?.detail || 'Invalid code'); }
    finally { setBusy(false); }
  };

  const disable = async () => {
    setErr(''); setBusy(true);
    try {
      await authAPI.mfaDisable(code);
      setUser({ ...user, mfa_enabled: false });
      setCode(''); setMsg('MFA disabled');
    } catch (e) { setErr(e.response?.data?.detail || 'Invalid code'); }
    finally { setBusy(false); }
  };

  return (
    <div style={card}>
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Two-factor authentication</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        {user.mfa_enabled ? '✅ MFA is currently enabled on your account.' : '⚠️ MFA is currently disabled. Enable it for stronger security.'}
      </p>

      {user.mfa_enabled ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input style={input} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          <button style={{ ...btn, background: '#ef4444' }} onClick={disable} disabled={busy || code.length !== 6}>
            {busy ? 'Working…' : 'Disable MFA'}
          </button>
        </div>
      ) : !secret ? (
        <button style={btn} onClick={beginSetup} disabled={busy}>{busy ? 'Working…' : 'Enable MFA'}</button>
      ) : (
        <div>
          <p style={{ fontSize: 13, marginBottom: 8 }}>Add this secret to your authenticator app, then enter the 6-digit code to confirm:</p>
          <code style={{ display: 'block', padding: 10, background: 'var(--bg)', borderRadius: 6, marginBottom: 8, wordBreak: 'break-all' }}>{secret}</code>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, wordBreak: 'break-all' }}>{uri}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input style={input} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus />
            <button style={btn} onClick={enable} disabled={busy || code.length !== 6}>
              {busy ? 'Verifying…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {err && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>{err}</p>}
      {msg && <p style={{ color: '#10b981', fontSize: 13, marginTop: 10 }}>{msg}</p>}
    </div>
  );
}

export default Settings;
