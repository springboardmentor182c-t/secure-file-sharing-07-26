import "./Sidebar.css";
import {
  FaThLarge,
  FaFolder,
  FaUpload,
  FaShareAlt,
  FaShieldAlt,
  FaHeartbeat,
  FaBell,
  FaChartBar,
  FaUserShield,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">

        <h2>VaultShare</h2>

        <p>Enterprise</p>

      </div>

      <ul>

        <li><FaThLarge /> Dashboard</li>

        <li><FaFolder /> File Management</li>

        <li><FaUpload /> Upload</li>

        <li><FaShareAlt /> Secure Sharing</li>

        <li><FaShieldAlt /> Encryption & Security</li>

        <li className="active"><FaHeartbeat /> Activity Monitor</li>

        <li><FaBell /> Notifications</li>

        <li><FaChartBar /> Analytics</li>

        <li><FaUserShield /> Admin</li>

      </ul>

      <div className="bottom">

        <p><FaUser /> Profile</p>

        <p><FaSignOutAlt /> Sign Out</p>

      </div>

    </div>
  );
}

export default Sidebar;