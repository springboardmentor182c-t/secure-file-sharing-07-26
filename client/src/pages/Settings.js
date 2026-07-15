import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import FormInput from '../components/Form/FormInput';
import ButtonGroup from '../components/Buttons/ButtonGroup';
import { User, Shield, Palette, Save, Check } from 'lucide-react';
import useVerifyPassword from '../features/authentication/hooks/useVerifyPassword';

export default function Settings() {
  const { user, token, refreshUser, theme, toggleTheme } = useAnalytics();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const passwordFeedback = useVerifyPassword(newPassword);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const payload = { full_name: fullName, bio };
      if (newPassword) {
        if (!passwordFeedback.isValid) {
          throw new Error('New password must satisfy security requirements.');
        }
        payload.password = newPassword;
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update settings');
      }

      await refreshUser();
      setNewPassword('');
      setStatusMsg({ text: 'Profile settings updated successfully!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your profile credentials and application preferences</p>
      </div>

      {statusMsg.text && (
        <div
          style={{
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${statusMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            color: statusMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {statusMsg.type === 'success' ? <Check size={18} /> : <span>⚠️</span>}
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Profile Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <User size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Personal Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormInput
              label="Full Name"
              type="text"
              id="settings-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
            />

            <div className="form-group">
              <label htmlFor="settings-bio" className="form-label">Biography</label>
              <textarea
                id="settings-bio"
                className="form-input"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '16px' }}>
              <Shield size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Update Password</h3>
            </div>

            <FormInput
              label="New Password"
              type="password"
              id="settings-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />

            {newPassword && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

            <ButtonGroup align="right">
              <button
                type="submit"
                disabled={loading || (newPassword && !passwordFeedback.isValid)}
                className="btn btn-primary"
                style={{ minWidth: '160px' }}
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </ButtonGroup>
          </form>
        </div>

        {/* Theme Preferences Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Palette size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Display Preferences</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600 }}>Theme Mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Toggle application styling between Light and Dark mode
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ minWidth: '130px' }}
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
