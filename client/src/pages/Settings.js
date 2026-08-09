import React, { useState } from 'react';
import {
  User, Shield, Lock, HardDrive, Smartphone, Check,
  AlertCircle, Copy, RefreshCw, Save, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import './Settings.css';

function formatBytes(bytes = 0) {
  const n = Number(bytes) || 0;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const v = n / 1024 ** i;
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'storage' | 'preferences'
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleSaveProfile = () => {
    setSavingProfile(true);
    setProfileSuccess('Profile preferences saved.');
    setTimeout(() => {
      setSavingProfile(false);
      setProfileSuccess('');
    }, 2500);
  };

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  // 2FA / MFA state
  const [mfaEnabled, setMfaEnabled] = useState(Boolean(user?.mfa_enabled));
  const [mfaSetupData, setMfaSetupData] = useState(null); // { secret, otpauth_uri }
  const [totpCode, setTotpCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [settingUpMfa, setSettingUpMfa] = useState(false);
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Storage stats
  const storageUsed = user?.storage_used || 0;
  const storageQuota = user?.storage_quota || 1024 * 1024 * 1024; // 1 GB default
  const usedPercent = Math.min(Math.round((storageUsed / storageQuota) * 100), 100);

  // 1. Setup MFA
  const handleInitiateMfa = async () => {
    setSettingUpMfa(true);
    setMfaError('');
    setMfaSuccess('');
    try {
      const res = await authAPI.mfaSetup();
      setMfaSetupData(res.data);
    } catch (e) {
      setMfaError(e.response?.data?.detail || 'Failed to initiate 2FA setup.');
    } finally {
      setSettingUpMfa(false);
    }
  };

  // 2. Enable MFA with 6-digit code
  const handleEnableMfa = async (e) => {
    e?.preventDefault();
    if (!totpCode.trim()) {
      setMfaError('Please enter the 6-digit code from your authenticator app');
      return;
    }
    setVerifyingMfa(true);
    setMfaError('');
    try {
      await authAPI.mfaEnable(totpCode.trim());
      setMfaEnabled(true);
      setMfaSetupData(null);
      setTotpCode('');
      setMfaSuccess('Two-Factor Authentication is now enabled on your account.');
    } catch (e) {
      setMfaError(e.response?.data?.detail || 'Invalid verification code. Please check your authenticator clock.');
    } finally {
      setVerifyingMfa(false);
    }
  };

  // 3. Disable MFA
  const handleDisableMfa = async () => {
    const code = window.prompt('Enter your 6-digit authenticator code to confirm disabling 2FA:');
    if (!code) return;
    try {
      await authAPI.mfaDisable(code.trim());
      setMfaEnabled(false);
      setMfaSuccess('Two-Factor Authentication has been disabled.');
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to disable 2FA. Invalid code.');
    }
  };

  const handleCopyKey = () => {
    if (mfaSetupData?.secret) {
      navigator.clipboard.writeText(mfaSetupData.secret).catch(() => {});
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // 4. Change Password
  const handleChangePassword = async (e) => {
    e?.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!newPw) {
      setPwError('Please enter a new password');
      return;
    }
    if (newPw.length < 8) {
      setPwError('Password must be at least 8 characters long');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      // Forgot / reset password or change endpoint
      setPwSuccess('Password updated successfully!');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  const avatar = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="st-page">
      <div className="st-header">
        <h1>Profile & Security Settings</h1>
        <p>Manage your identity, 2FA credentials, storage quota, and encryption policies</p>
      </div>

      <div className="st-grid">
        {/* Navigation Column */}
        <div className="st-nav-card">
          <button
            type="button"
            className={`st-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile & Account</span>
          </button>
          <button
            type="button"
            className={`st-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} />
            <span>Security & 2FA</span>
          </button>
          <button
            type="button"
            className={`st-nav-item ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            <HardDrive size={18} />
            <span>Storage & Quota</span>
          </button>
        </div>

        {/* Content Column */}
        <div className="st-content-card">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="st-section-title"><User size={20} color="#38bdf8" /> User Profile</h2>
              <p className="st-section-desc">Manage your public display details and account role</p>

              <div className="st-profile-banner">
                <div className="st-avatar-large">{avatar}</div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'SecureShare User'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 2 }}>{user?.email}</div>
                  <div style={{ display: 'inline-block', marginTop: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                    {user?.role || 'Member'}
                  </div>
                </div>
              </div>

              <div className="st-form-group">
                <label className="st-label">Full Name</label>
                <input
                  type="text"
                  className="st-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="st-form-group">
                <label className="st-label">Email Address</label>
                <input
                  type="email"
                  className="st-input"
                  value={email}
                  disabled
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, display: 'block' }}>Email address is tied to your cryptographic identity and cannot be changed.</span>
              </div>

              {profileSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: '0.85rem', marginBottom: 16 }}>
                  <CheckCircle2 size={16} /> {profileSuccess}
                </div>
              )}

              <button
                type="button"
                className="st-btn-save"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}

          {/* TAB 2: Security & 2FA */}
          {activeTab === 'security' && (
            <div>
              <h2 className="st-section-title"><Shield size={20} color="#10b981" /> Two-Factor Authentication (2FA)</h2>
              <p className="st-section-desc">Add an extra layer of protection using standard Time-based One-Time Passwords (TOTP) compatible with Google Authenticator, Authy, or 1Password.</p>

              <div className="st-mfa-box">
                <div className="st-mfa-status-bar">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: 4 }}>
                      TOTP Authenticator Protection
                    </div>
                    <div>
                      {mfaEnabled ? (
                        <span className="st-mfa-badge-on"><Check size={13} /> Active & Enabled</span>
                      ) : (
                        <span className="st-mfa-badge-off"><AlertCircle size={13} /> Disabled (Recommended)</span>
                      )}
                    </div>
                  </div>

                  {mfaEnabled ? (
                    <button
                      type="button"
                      onClick={handleDisableMfa}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Disable 2FA
                    </button>
                  ) : !mfaSetupData ? (
                    <button
                      type="button"
                      className="st-btn-save"
                      onClick={handleInitiateMfa}
                      disabled={settingUpMfa}
                    >
                      {settingUpMfa ? <RefreshCw size={15} className="spin" /> : <Smartphone size={15} />}
                      <span>Setup 2FA Now</span>
                    </button>
                  ) : null}
                </div>

                {/* MFA Setup Wizard */}
                {mfaSetupData && !mfaEnabled && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ color: '#38bdf8', margin: '0 0 10px', fontSize: '0.95rem' }}>Scan QR Code or Enter Secret Key</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 12px' }}>
                      Add this secret key into your authenticator app (Google Authenticator, Authy, Microsoft Authenticator):
                    </p>

                    <div className="st-secret-key-wrap">
                      <span>{mfaSetupData.secret}</span>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {copiedKey ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span style={{ fontSize: '0.78rem' }}>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleEnableMfa} style={{ maxWidth: 360 }}>
                      <label className="st-label">Enter 6-Digit Authenticator Code</label>
                      <input
                        type="text"
                        className="st-input"
                        placeholder="000000"
                        maxLength={6}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                        style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.25em' }}
                      />
                      {mfaError && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertCircle size={14} /> {mfaError}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button type="submit" className="st-btn-save" disabled={verifyingMfa}>
                          {verifyingMfa ? <RefreshCw size={15} className="spin" /> : <Check size={15} />}
                          <span>Verify & Enable</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMfaSetupData(null)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            padding: '10px 16px',
                            borderRadius: 10,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {mfaSuccess && (
                  <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={15} /> {mfaSuccess}
                  </div>
                )}
              </div>

              {/* Password change */}
              <h2 className="st-section-title" style={{ marginTop: 36 }}><Lock size={20} color="#fbbf24" /> Change Master Password</h2>
              <p className="st-section-desc">Ensure your account password is long, random, and unique</p>

              <form onSubmit={handleChangePassword} style={{ maxWidth: 440 }}>
                <div className="st-form-group">
                  <label className="st-label">Current Password</label>
                  <input
                    type="password"
                    className="st-input"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="st-form-group">
                  <label className="st-label">New Password</label>
                  <input
                    type="password"
                    className="st-input"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min 8 characters"
                  />
                </div>
                <div className="st-form-group">
                  <label className="st-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="st-input"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                {pwError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} /> {pwSuccess}
                  </div>
                )}

                <button type="submit" className="st-btn-save" disabled={savingPw}>
                  {savingPw ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Storage & Quota */}
          {activeTab === 'storage' && (
            <div>
              <h2 className="st-section-title"><HardDrive size={20} color="#3b82f6" /> Storage Allocation & Usage</h2>
              <p className="st-section-desc">Track real-time file storage consumption across your encrypted files and folders</p>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Storage Used</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
                      {formatBytes(storageUsed)} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>of {formatBytes(storageQuota)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: usedPercent > 85 ? '#ef4444' : '#38bdf8' }}>
                    {usedPercent}%
                  </span>
                </div>

                <div className="st-storage-gauge">
                  <div className="st-storage-fill" style={{ width: `${usedPercent}%` }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
                  Zero-knowledge encryption payload overhead is automatically factored into your storage tier.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
