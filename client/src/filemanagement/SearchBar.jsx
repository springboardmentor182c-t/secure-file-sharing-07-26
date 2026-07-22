import React from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Share2,
  ShieldCheck,
  Activity,
  Bell,
  BarChart3,
  Settings,
  User,
  LogOut,
  HardDrive,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, title: "Dashboard" },
    { icon: <FolderOpen size={20} />, title: "File Management", active: true },
    { icon: <Upload size={20} />, title: "Upload" },
    { icon: <Share2 size={20} />, title: "Secure Sharing" },
    { icon: <ShieldCheck size={20} />, title: "Encryption & Security" },
    { icon: <Activity size={20} />, title: "Activity Monitor" },
    { icon: <Bell size={20} />, title: "Notifications" },
    { icon: <BarChart3 size={20} />, title: "Analytics" },
    { icon: <Settings size={20} />, title: "Admin" },
  ];

  return (
    <aside className="sidebar">

      <div className="logo-section">
        <div className="logo-circle">
          <HardDrive size={28} />
        </div>

        <div>
          <h2>VaultShare</h2>
          <p>Enterprise</p>
        </div>
      </div>

      <nav className="menu">

        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`menu-item ${item.active ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.title}</span>
          </div>
        ))}

      </nav>

      <div className="sidebar-footer">

        <div className="menu-item">
          <User size={20} />
          <span>Profile</span>
        </div>

        <div className="menu-item logout">
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;