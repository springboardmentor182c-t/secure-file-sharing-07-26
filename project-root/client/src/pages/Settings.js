import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsAPI } from '../utils/api';
import { Eye, EyeOff, Laptop, Smartphone, Monitor } from 'lucide-react';
import MFACard from './MFACard';  // NEW: MFA setup component
import './Settings.css';

// FIX ISS-S2: extract backend error message helper
const getApiErrorMessage = (err, fallback) => {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
};

// FIX ISS-S6: format ISO date to human-readable "time ago"
const formatLastActive = (isoString) => {
  if (!isoString) return 'Unknown';
  try {
    const then = new Date(isoString);
    const now = new Date();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    return then.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return isoString;
  }
};

const Settings = () => {
  const { user, setUser } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('profile');

  // Feedback states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Profile Tab State ──────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [organization, setOrganization] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  // ── Security Tab State ─────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Sessions Tab State ─────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // ── Notification Prefs Tab State ───────────────────────────
  const [notifPrefs, setNotifPrefs] = useState({
    file_shares: { in_app: true, email: true },
    downloads: { in_app: true, email: false },
    security_alerts: { in_app: true, email: true },
    link_expirations: { in_app: false, email: true },
    access_changes: { in_app: true, email: false },
    system_updates: { in_app: false, email: false },
  });
  const [digestFrequency, setDigestFrequency] = useState('daily');

  // FIX ISS-S4: separate one-time loads from user-dependent hydration
  // Load initial data ONCE on mount (not on every user context change)
  useEffect(() => {
    // Load profile details
    settingsAPI.getProfile().then(({ data }) => {
      setFullName(data.name || '');
      setEmailAddress(data.email || '');
      setOrganization(data.organization || '');
      setAvatarUrl(data.avatar_url || null);
    }).catch((err) => {
      // FIX ISS-S1: surface errors instead of swallowing them
      setErrorMsg(getApiErrorMessage(err, 'Failed to load profile.'));
    });

    // Load active sessions
    setLoadingSessions(true);
    settingsAPI.getSessions()
      .then(({ data }) => setSessions(data))
      .catch((err) => {
        // FIX ISS-S1: surface sessions load errors
        setErrorMsg(getApiErrorMessage(err, 'Failed to load active sessions.'));
      })
      .finally(() => setLoadingSessions(false));

    // Load notification preferences
    settingsAPI.getNotificationPreferences().then(({ data }) => {
      const { digest_frequency, ...rest } = data;
      setNotifPrefs(rest);
      setDigestFrequency(digest_frequency);
    }).catch((err) => {
      // FIX ISS-S1: surface notification prefs load errors
      setErrorMsg(getApiErrorMessage(err, 'Failed to load notification preferences.'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // FIX ISS-S4: run once on mount only, not on user change

  // FIX ISS-S4: sync form fields when user context changes (login, refresh)
  // WITHOUT re-fetching from API
  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.name || '');
      setEmailAddress((prev) => prev || user.email || '');
      setAvatarUrl((prev) => prev || user.avatar_url || null);
    }
  }, [user]);

  // Clear feedback messages on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSuccessMsg('');
    setErrorMsg('');
  };

  // ── Handlers ───────────────────────────────────────────────

  // Trigger file selection for avatar upload
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Avatar file change preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 2 MB');
        setSuccessMsg('');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        setErrorMsg('');
        setSuccessMsg('Photo uploaded! Click "Save Changes" to apply.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!fullName.trim() || !emailAddress.trim()) {
      setErrorMsg('Full Name and Email Address are required.');
      return;
    }

    try {
      const updateData = {
        name: fullName,
        email: emailAddress,
        organization,
        avatar_url: avatarUrl,
      };
      const { data } = await settingsAPI.updateProfile(updateData);

      // FIX ISS-S3: sync ALL updated fields to global user context including organization
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          name: data.name || fullName,
          email: data.email || emailAddress,
          organization: data.organization !== undefined ? data.organization : organization,
          avatar_url: data.avatar_url !== undefined ? data.avatar_url : avatarUrl,
        }));
      }

      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      // FIX ISS-S2: surface actual backend error
      setErrorMsg(getApiErrorMessage(err, 'Failed to update profile.'));
    }
  };

  // Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your new password.');
      return;
    }

    try {
      await settingsAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccessMsg(
        'Password changed successfully! Other devices have been signed out for security.'
      );
      // Reset inputs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh sessions list to reflect the security cleanup
      settingsAPI.getSessions()
        .then(({ data }) => setSessions(data))
        .catch(() => { });
    } catch (err) {
      // FIX ISS-S2: surface actual backend error (e.g. "Current password is incorrect")
      setErrorMsg(getApiErrorMessage(err, 'Failed to update password.'));
    }
  };

  // Revoke single session
  const handleSignOutSession = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await settingsAPI.logoutSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSuccessMsg('Signed out of session successfully.');
    } catch (err) {
      // FIX ISS-S2: surface backend error
      setErrorMsg(getApiErrorMessage(err, 'Failed to sign out session.'));
    }
  };

  // Revoke all other sessions
  const handleSignOutAllOthers = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await settingsAPI.logoutAllSessions();
      setSessions((prev) => prev.filter((s) => s.is_current));
      setSuccessMsg('Signed out of all other sessions successfully.');
    } catch (err) {
      // FIX ISS-S2: surface backend error
      setErrorMsg(getApiErrorMessage(err, 'Failed to sign out other sessions.'));
    }
  };

  // Toggle notification rows
  const handleTogglePref = (activityKey, channel) => {
    setNotifPrefs((prev) => ({
      ...prev,
      [activityKey]: {
        ...prev[activityKey],
        [channel]: !prev[activityKey][channel],
      },
    }));
  };

  // Save preferences
  const handleSavePreferences = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const data = {
        ...notifPrefs,
        digest_frequency: digestFrequency,
      };
      const { data: res } = await settingsAPI.updateNotificationPreferences(data);
      const { digest_frequency, ...savedPreferences } = res;
      setNotifPrefs(savedPreferences);
      setDigestFrequency(digest_frequency);
      setSuccessMsg('Notification preferences saved successfully!');
    } catch (err) {
      // FIX ISS-S2: surface backend error
      setErrorMsg(getApiErrorMessage(err, 'Failed to update notification preferences.'));
    }
  };

  // Helpers
  const getInitials = (name) => {
    if (!name) return 'TS';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
      case 'phone':
        return <Smartphone size={18} />;
      case 'tablet':
        return <Laptop size={18} />;
      case 'desktop':
        return <Monitor size={18} />;
      default:
        return <Laptop size={18} />;
    }
  };

  return (
    <div className="settings-container fade-in">
      <div className="page-header-left">
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Settings</h1>
        <p className="settings-subtitle">Manage your account, security and preferences.</p>
      </div>

      {/* Tabs list */}
      <div className="settings-tabs-wrapper">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </button>
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            Security
          </button>
          <button
            className={`settings-tab ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => handleTabChange('sessions')}
          >
            Sessions
          </button>
          <button
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            Notification Preferences
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Messaging */}
      {successMsg && <div className="alert-feedback alert-success">✓ {successMsg}</div>}
      {errorMsg && <div className="alert-feedback alert-error">⚠️ {errorMsg}</div>}

      {/* ── PROFILE TAB ────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Profile Information</h2>
          </div>

          <form onSubmit={handleSaveProfile}>
            {/* Avatar Selection */}
            <div className="avatar-section">
              <div
                className="avatar-preview-container"
                style={{
                  background: !avatarUrl ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : 'var(--bg-input)',
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User avatar" className="avatar-preview-image" />
                ) : (
                  <span className="avatar-initials">{getInitials(fullName)}</span>
                )}
              </div>

              <div className="avatar-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg, image/jpg"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={triggerFileInput}
                >
                  Change Photo
                </button>
                <span className="avatar-helper-text">JPG, PNG up to 2 MB</span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="emailAddress">Email Address</label>
              <input
                id="emailAddress"
                type="email"
                className="form-input"
                placeholder="Your email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="organization">Organization</label>
              <input
                id="organization"
                type="text"
                className="form-input"
                placeholder="Your organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SECURITY TAB ───────────────────────────────────────── */}
      {activeTab === 'security' && (
        <>
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">Change Password</h2>
              <p className="settings-card-subtitle">Use a strong password you don't use elsewhere. Changing your password will sign you out on other devices.</p>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Verify new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-visibility-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* NEW: MFA Setup Card */}
          <MFACard
            onSuccess={(msg) => { setSuccessMsg(msg); setErrorMsg(''); }}
            onError={(msg) => { setErrorMsg(msg); setSuccessMsg(''); }}
          />
        </>
      )}

      {/* ── SESSIONS TAB ───────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <div className="settings-card">
          <div className="sessions-list-header">
            <div>
              <h2 className="settings-card-title">Active Sessions</h2>
              <p className="settings-card-subtitle">Devices currently signed into your account.</p>
            </div>
            {sessions.filter((s) => !s.is_current).length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSignOutAllOthers}
              >
                Sign out all others
              </button>
            )}
          </div>

          {loadingSessions ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.length === 0 && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No active sessions found.
                </div>
              )}
              {sessions.map((s) => (
                <div key={s.id} className="session-item">
                  <div className="session-info-left">
                    <div className="session-icon-box">
                      {getDeviceIcon(s.device_type)}
                    </div>
                    <div className="session-text">
                      <div className="session-device-meta">
                        <span className="session-device-name">{s.device_name}</span>
                        {s.is_current && <span className="session-badge-current">Current</span>}
                      </div>
                      <span className="session-details">
                        {/* FIX ISS-S6: human-readable last_active + skip empty values */}
                        {[s.browser_name, s.location, s.ip_address, formatLastActive(s.last_active)]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    </div>
                  </div>

                  {!s.is_current && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleSignOutSession(s.id)}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ──────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title">Notification Preferences</h2>
            <p className="settings-card-subtitle">Choose how you want to be notified for each activity.</p>
          </div>

          {/* Matrix Checklist */}
          <div className="notification-matrix">
            <div className="notification-matrix-header">
              <span>Activity Type</span>
              <span style={{ textAlign: 'center' }}>In-App</span>
              <span style={{ textAlign: 'center' }}>Email</span>
            </div>

            {/* Matrix Rows */}
            {[
              { key: 'file_shares', label: 'File Shares', desc: 'When someone shares a file or folder with you' },
              { key: 'downloads', label: 'Downloads', desc: 'When someone downloads your shared file' },
              { key: 'security_alerts', label: 'Security Alerts', desc: 'When there is a new login or suspicious activity' },
              { key: 'link_expirations', label: 'Link Expirations', desc: 'When your shared links are about to expire' },
              { key: 'access_changes', label: 'Access Changes', desc: 'When your access permissions are modified' },
              { key: 'system_updates', label: 'System Updates', desc: 'Important news and updates about TrustShare' },
            ].map((row) => (
              <div key={row.key} className="notification-row">
                <div className="notification-info">
                  <span className="notification-name">{row.label}</span>
                  <span className="notification-desc">{row.desc}</span>
                </div>

                <div className="notification-toggle-cell">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifPrefs[row.key]?.in_app || false}
                      onChange={() => handleTogglePref(row.key, 'in_app')}
                    />
                    <span className="toggle-track"></span>
                    <span className="toggle-thumb"></span>
                  </label>
                </div>

                <div className="notification-toggle-cell">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={notifPrefs[row.key]?.email || false}
                      onChange={() => handleTogglePref(row.key, 'email')}
                    />
                    <span className="toggle-track"></span>
                    <span className="toggle-thumb"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Frequency Selector */}
          <div className="digest-section">
            <h3 className="digest-title">Email Digest Frequency</h3>
            <p className="digest-subtitle">Select how often you would like to receive general notification digests.</p>

            <div className="digest-options">
              {['instant', 'daily', 'weekly', 'never'].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  className={`digest-btn ${digestFrequency === freq ? 'active' : ''}`}
                  onClick={() => setDigestFrequency(freq)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;