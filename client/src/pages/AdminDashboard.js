import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";

import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

import StorageTab from "../components/StorageTab";
import SystemHealth from "../components/SystemHealth";
import AuditReports from "../components/AuditReports";

import {
  Users,
  HardDrive,
  Activity,
  AlertCircle,
  UserPlus,
  MoreVertical,
} from "lucide-react";
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  const [dashboard, setDashboard] = useState({});
  const [users, setUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [role, setRole] = useState("Admin");
const [openMenu, setOpenMenu] = useState(null);
const [editingUser, setEditingUser] = useState(null);
const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editRole, setEditRole] = useState("Admin");
const [search, setSearch] = useState("");
const [showShareModal, setShowShareModal] = useState(false);
const shareLink = "http://localhost:3001/shared/admin";
  useEffect(() => {
    loadDashboard();
    loadUsers();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const editUser = (user) => {
  setEditingUser(user);
  setEditName(user.name);
  setEditEmail(user.email);
  setEditRole(user.role);
  setOpenMenu(null);
};
const updateUser = async () => {
  try {
    await axios.put(
      `http://localhost:8000/admin/users/${editingUser.id}`,
      {
        name: editName,
        email: editEmail,
        role: editRole,
        storage_used: editingUser.storage_used,
        last_login: editingUser.last_login,
        status: editingUser.status,
      }
    );

    alert("User updated successfully");
    setEditingUser(null);
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};
  const deleteUser = async (id) => {
  try {
    await axios.delete(`http://localhost:8000/admin/users/${id}`);
    loadUsers();
    setOpenMenu(null);
    alert("User deleted successfully");
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};
  const sendInvite = async () => {
  try {
    await axios.post("http://localhost:8000/admin/users", {
      name,
      email,
      role,
      storage_used: "0 GB",
      last_login: "Never",
      status: "Active",
    });

    alert("User added successfully");

    setShowInviteModal(false);

    setName("");
    setEmail("");
    setRole("Admin");

    loadUsers();
  } catch (err) {
    console.error(err);
    alert("Failed to add user");
  }
};
  const stats = [
    {
      title: "Total Users",
      value: dashboard.total_users || 0,
      subtitle: `${dashboard.active_users || 0} Active • ${
        dashboard.suspended_users || 0
      } Suspended`,
      icon: <Users size={22} />,
      color: "blue",
    },
    {
      title: "Storage Used",
      value: dashboard.storage_used || "0 KB",
      subtitle: `Limit: ${dashboard.storage_limit || "50 GB"}`,
      icon: <HardDrive size={22} />,
      color: "orange",
    },
    {
      title: "System Health",
      value: dashboard.system_health || "99.9%",
      subtitle: "Uptime last 30 days",
      icon: <Activity size={22} />,
      color: "greenbg",
    },
    {
      title: "Open Issues",
      value: dashboard.open_issues || 0,
      subtitle: "Critical & Warning",
      icon: <AlertCircle size={22} />,
      color: "red",
    },
  ];
  const filteredUsers = users.filter(
  (user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="dashboard">
  <Sidebar />

  <div className="dashboard-content">
    <Header 
    search={search}
    setSearch={setSearch}
    setShowShareModal={setShowShareModal}/>

    <div className="stats-grid">
      {stats.map((item, index) => (
        <div className="card" key={index}>
          <div className="card-top">

            <div>
              <p>{item.title}</p>
              <h2>{item.value}</h2>
              <span>{item.subtitle}</span>
            </div>

            <div className={`icon-circle ${item.color}`}>
              {item.icon}
            </div>

          </div>
        </div>
      ))}
    </div>

    <div className="tabs">

      <button
        className={activeTab === "users" ? "active" : ""}
        onClick={() => setActiveTab("users")}
      >
        Users
      </button>

      <button
        className={activeTab === "storage" ? "active" : ""}
        onClick={() => setActiveTab("storage")}
      >
        Storage
      </button>

      <button
        className={activeTab === "health" ? "active" : ""}
        onClick={() => setActiveTab("health")}
      >
        System Health
      </button>

      <button
        className={activeTab === "audit" ? "active" : ""}
        onClick={() => setActiveTab("audit")}
      >
        Audit Reports
      </button>

    </div>
    {activeTab === "users" && (
  <div className="table-card">

    <div className="table-header">
      <div>
        <h3>User Management</h3>
        <p>Manage user accounts and permissions</p>
      </div>

      <button
        className="invite-btn"
        onClick={() => setShowInviteModal(true)}
      >
        <UserPlus size={18} />
        Invite User
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Storage Used</th>
          <th>Last Login</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user.id}>

            <td>
              <div className="user-info">
                <img
                  src={`https://i.pravatar.cc/100?img=${user.id + 20}`}
                  alt={user.name}
                />

                <div>
                  <h4>{user.name}</h4>
                  <span>{user.email}</span>
                </div>
              </div>
            </td>

            <td>
              <span className={`role ${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </td>

            <td>{user.storage_used}</td>

            <td>{user.last_login}</td>

            <td>
              <span className={`status ${user.status.toLowerCase()}`}>
                {user.status}
              </span>
            </td>

            <td>
              <div className="menu-container">
  <button
    className="menu-btn"
    onClick={() =>
      setOpenMenu(openMenu === user.id ? null : user.id)
    }
  >
    <MoreVertical size={18} />
  </button>

  {openMenu === user.id && (
    <div className="dropdown-menu">
      <button onClick={()=>editUser(user)} >Edit</button>
      <button onClick={()=>deleteUser(user.id)}>Delete</button>
    </div>
  )}
</div>
            </td>

          </tr>
        ))}
      </tbody>
    </table>

  </div>
)}
{showInviteModal && (
  <div className="modal-overlay">

    <div className="invite-modal">

      <h2>Invite User</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <select
      value={role}
      onChange={(e)=>setRole(e.target.value)}>
        <option>Admin</option>
        <option>Editor</option>
        <option>Viewer</option>
      </select>

      <div className="modal-buttons">

        <button
          onClick={() => setShowInviteModal(false)}
        >
          Cancel
        </button>

        <button className="send-btn"
        onClick={sendInvite}>
          Send Invite
        </button>

      </div>

    </div>

  </div>
)}
{showShareModal && (
  <div className="modal-overlay">
    <div className="invite-modal">
      <h2>Share Dashboard</h2>

      <input
        type="text"
        value={shareLink}
        readOnly
      />

      <div className="modal-buttons">
        <button onClick={() => setShowShareModal(false)}>
          Close
        </button>

        <button
          className="send-btn"
          onClick={() => {
            navigator.clipboard.writeText(shareLink);
            alert("Link copied!");
          }}
        >
          Copy Link
        </button>
      </div>
    </div>
  </div>
)}
        {/* STORAGE TAB */}
        {activeTab === "storage" && <StorageTab />}

        {/* SYSTEM HEALTH TAB */}
        {activeTab === "health" && <SystemHealth />}

        {/* AUDIT REPORTS TAB */}
        {activeTab === "audit" && <AuditReports />}
        {editingUser && (
  <div className="modal-overlay">
    <div className="invite-modal">
      <h2>Edit User</h2>

      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
      />

      <input
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
      />

      <select
        value={editRole}
        onChange={(e) => setEditRole(e.target.value)}
      >
        <option>Admin</option>
        <option>Editor</option>
        <option>Viewer</option>
      </select>

      <div className="modal-buttons">
        <button onClick={() => setEditingUser(null)}>
          Cancel
        </button>

        <button
          className="send-btn"
          onClick={updateUser}
        >
          Update
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default AdminDashboard;
