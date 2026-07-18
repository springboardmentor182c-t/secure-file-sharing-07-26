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
} from "react-icons/fi";
const Sidebar = () => {
  return (
    <aside className="sidebar">

      <div className="logo-section">
        <h2>VaultShare</h2>
        <p>Enterprise</p>
      </div>

      <ul className="menu">

        <li>🏠 Dashboard</li>

        <li className="active">
          📁 File Management
        </li>

        <li>⬆ Upload</li>

        <li>🔗 Secure Sharing</li>

        <li>🛡 Encryption & Security</li>

        <li>📈 Activity Monitor</li>

        <li>🔔 Notifications</li>

        <li>📊 Analytics</li>

        <li>⚙ Admin</li>

      </ul>

      <div className="sidebar-footer">

        <p>👤 Profile</p>

        <p>🚪 Sign Out</p>

      </div>

    </aside>
  );
};

export default Sidebar;