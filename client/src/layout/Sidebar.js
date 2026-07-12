import React from "react";
import "./Sidebar.css";

import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Share2,
  Shield,
  Activity,
  Bell,
  BarChart3,
  UserCog,
  User,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="sidebar">

      {/* Logo */}

      <div className="sidebar-top">

        <div className="logo">

          <div className="logo-icon">
            🛡️
          </div>

          <div>

            <h2>VaultShare</h2>

            <span>Enterprise</span>

          </div>

        </div>

        <div className="menu">

          <div className="menu-item">
            <LayoutDashboard size={20}/>
            <span>Dashboard</span>
          </div>

          <div className="menu-item">
            <FolderOpen size={20}/>
            <span>File Management</span>
          </div>

          <div className="menu-item">
            <Upload size={20}/>
            <span>Upload</span>
          </div>

          <div className="menu-item">
            <Share2 size={20}/>
            <span>Secure Sharing</span>
          </div>

          <div className="menu-item">
            <Shield size={20}/>
            <span>Encryption & Security</span>
          </div>

          <div className="menu-item">
            <Activity size={20}/>
            <span>Activity Monitor</span>
          </div>

          <div className="menu-item">
            <Bell size={20}/>
            <span>Notifications</span>
          </div>

          <div className="menu-item">
            <BarChart3 size={20}/>
            <span>Analytics</span>
          </div>

          <div className="menu-item active">
            <UserCog size={20}/>
            <span>Admin</span>
          </div>

        </div>

      </div>

      <div className="sidebar-bottom">

        <div className="menu-item">
          <User size={20}/>
          <span>Profile</span>
        </div>

        <div className="menu-item">
          <LogOut size={20}/>
          <span>Sign Out</span>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;