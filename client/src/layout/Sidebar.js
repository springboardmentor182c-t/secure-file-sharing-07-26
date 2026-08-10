import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Folder,
  Link2,
  Trash2,
  ShieldAlert,
  Settings,
  User,
  HardDrive,
  LogOut,
  Clock,
  BarChart3,
  Share2,
  Bell,
  Sparkles
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ users, stats, currentUser }) {
  const location = useLocation();
  const [storageData, setStorageData] = useState({ used_bytes: 0, total_bytes: 10 * 1024 * 1024 * 1024, used_percent: 0 });

  const fetchStorageStats = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_BASE_URL}/files/storage-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setStorageData(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStorageStats();

    // Listen for custom storage-updated events triggered by file upload/delete/restore
    window.addEventListener("storage-updated", fetchStorageStats);

    // Periodic 5-second polling interval for real-time live storage status updates
    const interval = setInterval(fetchStorageStats, 5000);

    return () => {
      window.removeEventListener("storage-updated", fetchStorageStats);
      clearInterval(interval);
    };
  }, [location.pathname]);

  const mainLinks = [
    { name: "My Files", path: "/files", icon: Folder },
    { name: "Shared Files", path: "/shared-files", icon: Link2 },
    { name: "Shared Links", path: "/shared-links", icon: Share2 },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Recent", path: "/recent", icon: Clock },
    { name: "Trash", path: "/trash", icon: Trash2 },
  ];

  const securityLinks = [
    { name: "Admin Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Audit Logs", path: "/audit", icon: ShieldAlert },
    { name: "Security", path: "/security", icon: ShieldAlert },
  ];

  const accountLinks = [
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const NavItem = ({ name, path, icon: Icon }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? "bg-purple-600/20 text-white border-l-2 border-purple-500 font-semibold"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon size={18} />
        <span className="text-sm">{name}</span>
      </Link>
    );
  };

  const usedBytes = storageData?.used_bytes || 0;
  const percent = storageData?.used_percent ?? storageData?.used_percentage ?? 0;

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 MB";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="w-64 bg-[#13131a] h-screen sticky top-0 flex flex-col justify-between border-r border-gray-800">
      <div className="overflow-y-auto flex-1 px-3 py-4">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
            T
          </div>
          <div>
            <p className="text-white font-semibold text-sm">TrustShare</p>
            <p className="text-gray-500 text-xs">Secure File Sharing</p>
          </div>
        </div>

        <p className="text-gray-500 text-xs px-4 mb-2 mt-4 font-semibold uppercase tracking-wider">MAIN</p>
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>

        <p className="text-gray-500 text-xs px-4 mb-2 mt-6 font-semibold uppercase tracking-wider">SECURITY</p>
        <div className="space-y-1">
          {securityLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>

        <p className="text-gray-500 text-xs px-4 mb-2 mt-6 font-semibold uppercase tracking-wider">ACCOUNT</p>
        <div className="space-y-1">
          {accountLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-[#1a1a22] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <HardDrive size={16} className="text-purple-400" />
              Storage
            </div>
            <span className="text-xs text-gray-400">{percent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div className="h-full rounded-full bg-[#7C5CFC] transition-all duration-500" style={{ width: `${Math.max(percent, usedBytes > 0 ? 3 : 0)}%` }} />
          </div>
          <p className="mt-3 text-xs text-gray-400">{formatSize(usedBytes)} / 10 GB Used</p>
        </div>

        <div className="border-t border-[#34364A] pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white font-bold">
                {currentUser?.initials || currentUser?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {currentUser?.name || "User"}
                </h3>
                <p className="text-xs text-gray-400">
                  {currentUser?.role || currentUser?.email || "Editor"}
                </p>
              </div>
            </div>
            <LogOut size={16} className="text-gray-500 cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
