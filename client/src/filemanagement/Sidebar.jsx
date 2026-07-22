import React from "react";
import {
  FiFolder,
  FiUpload,
  FiShield,
  FiActivity,
  FiBell,
  FiBarChart2,
  FiSettings,
  FiHome,
  FiUser,
  FiLogOut,
  
} from "react-icons/fi";
const Sidebar = () => {
  return (
    <aside className="sidebar">

      <div className="logo-section">
        <h2>VaultShare</h2>
        <p>Enterprise</p>
      </div>

      <ul className="menu">

        <li><FiHome /> Dashboard</li>

        <li className="active">
          <FiFolder /> File Management
        </li>

        <li><FiUpload /> Upload</li>

        <li><FiShield /> Secure Sharing</li>

        <li><FiShield /> Encryption & Security</li>

        <li><FiActivity /> Activity Monitor</li>

        <li><FiBell /> Notifications</li>

        <li><FiBarChart2 /> Analytics</li>

        <li><FiSettings /> Admin</li>

      </ul>

      <div className="sidebar-footer">

        <p><FiUser /> Profile</p>

        <p><FiLogOut /> Sign Out</p>

      </div>

    </aside>
  );
};

export default Sidebar;