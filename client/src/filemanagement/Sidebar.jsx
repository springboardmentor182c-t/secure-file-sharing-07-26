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

      <div>
        <div className="logo-section">

          <div className="logo-circle">
            <FiShield size={22} />
          </div>

          <div>
            <h2>VaultShare</h2>
            <p>Enterprise</p>
          </div>

        </div>

        <ul className="menu">

          <li className="menu-item">
            <FiHome />
            <span>Dashboard</span>
          </li>

          <li className="menu-item active">
            <FiFolder />
            <span>File Management</span>
          </li>

          <li className="menu-item">
            <FiUpload />
            <span>Upload</span>
          </li>

          <li className="menu-item">
            <FiShield />
            <span>Secure Sharing</span>
          </li>

          <li className="menu-item">
            <FiShield />
            <span>Encryption & Security</span>
          </li>

          <li className="menu-item">
            <FiActivity />
            <span>Activity Monitor</span>
          </li>

          <li className="menu-item">
            <FiBell />
            <span>Notifications</span>
          </li>

          <li className="menu-item">
            <FiBarChart2 />
            <span>Analytics</span>
          </li>

          <li className="menu-item">
            <FiSettings />
            <span>Admin</span>
          </li>

        </ul>
      </div>

      <div className="sidebar-footer">

        <div className="menu-item">
          <FiUser />
          <span>Profile</span>
        </div>

        <div className="menu-item logout">
          <FiLogOut />
          <span>Sign Out</span>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;