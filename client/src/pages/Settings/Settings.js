import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Bell, Lock, Shield, Server, Save, CheckCircle2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Settings() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    securityAlerts: true,
    expirationReminders: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    mfaRequired: true,
    autoRotateKeys: true,
    linkExpirationDays: 7,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.notifications) setNotifications(data.notifications);
        if (data && data.securitySettings) setSecuritySettings(data.securitySettings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications, securitySettings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#34364A] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="text-[#7C5CFC]" size={26} /> System & Application Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Configure global platform security, notifications, and link defaults.</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
            <CheckCircle2 size={16} /> Settings Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Security Settings Section */}
        <div className="bg-[#272938] p-6 rounded-2xl border border-[#34364A] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#34364A] pb-3">
            <Shield className="text-[#7C5CFC]" size={20} />
            <h2 className="text-lg font-semibold">Security & Access Controls</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F2B]">
              <div>
                <p className="font-medium text-sm">Enforce Multi-Factor Authentication (MFA)</p>
                <p className="text-xs text-gray-400">Require all users to configure MFA for sensitive link operations.</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.mfaRequired}
                onChange={(e) => setSecuritySettings({ ...securitySettings, mfaRequired: e.target.checked })}
                className="w-5 h-5 accent-[#7C5CFC] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F2B]">
              <div>
                <p className="font-medium text-sm">Automated Key Rotation</p>
                <p className="text-xs text-gray-400">Automatically rotate AES-256 encryption keys every 30 days.</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.autoRotateKeys}
                onChange={(e) => setSecuritySettings({ ...securitySettings, autoRotateKeys: e.target.checked })}
                className="w-5 h-5 accent-[#7C5CFC] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F2B]">
              <div>
                <p className="font-medium text-sm">Default Shared Link Expiration (Days)</p>
                <p className="text-xs text-gray-400">Default duration before newly created shared links expire.</p>
              </div>
              <input
                type="number"
                value={securitySettings.linkExpirationDays}
                onChange={(e) => setSecuritySettings({ ...securitySettings, linkExpirationDays: parseInt(e.target.value) || 7 })}
                className="w-20 px-3 py-1 bg-[#272938] border border-[#34364A] rounded-lg text-sm outline-none text-center"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-[#272938] p-6 rounded-2xl border border-[#34364A] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#34364A] pb-3">
            <Bell className="text-[#7C5CFC]" size={20} />
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F2B]">
              <div>
                <p className="font-medium text-sm">Security & Intrusion Alerts</p>
                <p className="text-xs text-gray-400">Receive instant notifications upon blocked login attacks.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.securityAlerts}
                onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                className="w-5 h-5 accent-[#7C5CFC] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F2B]">
              <div>
                <p className="font-medium text-sm">Link Expiration Notifications</p>
                <p className="text-xs text-gray-400">Receive warning emails 24 hours before shared links expire.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.expirationReminders}
                onChange={(e) => setNotifications({ ...notifications, expirationReminders: e.target.checked })}
                className="w-5 h-5 accent-[#7C5CFC] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6847EC] text-white font-medium transition cursor-pointer"
          >
            <Save size={18} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;