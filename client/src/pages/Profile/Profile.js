import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Key, CheckCircle2, Save, HardDrive, Calendar } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Profile() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    role: "System Administrator",
    department: "",
    storageUsedGB: 0,
    storageLimitGB: 1000,
  });


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.fullName) {
          setProfile((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => ({ ...prev, ...updated }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
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
            <User className="text-[#7C5CFC]" size={26} /> User Profile & Security Account
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account profile, role permissions, and storage quotas.</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
            <CheckCircle2 size={16} /> Profile Updated
          </div>
        )}
      </div>

      {/* User Card Header */}
      <div className="bg-[#272938] p-6 rounded-2xl border border-[#34364A] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white font-bold text-2xl border-2 border-white/20">
            AU
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.fullName}</h2>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {profile.role}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#1E1F2B] p-4 rounded-xl border border-[#34364A] w-full md:w-64 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><HardDrive size={14} className="text-[#7C5CFC]" /> Storage Usage</span>
            <span>{profile.storageUsedGB} GB / {profile.storageLimitGB} GB</span>
          </div>
          <div className="w-full bg-[#272938] rounded-full h-2">
            <div className="bg-[#7C5CFC] h-2 rounded-full" style={{ width: `${(profile.storageUsedGB / profile.storageLimitGB) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleUpdate} className="bg-[#272938] p-6 rounded-2xl border border-[#34364A] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#34364A] pb-3">
          <Shield className="text-[#7C5CFC]" size={20} />
          <h3 className="text-lg font-semibold">Account Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F2B] border border-[#34364A] text-sm outline-none focus:border-[#7C5CFC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F2B] border border-[#34364A] text-sm outline-none focus:border-[#7C5CFC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F2B] border border-[#34364A] text-sm outline-none focus:border-[#7C5CFC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Assigned Role</label>
            <input
              type="text"
              disabled
              value={profile.role}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F2B]/60 border border-[#34364A] text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6847EC] text-white font-medium transition cursor-pointer"
          >
            <Save size={18} /> Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;