import React from "react";
import useAdminData from "./hooks/useAdminData";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import StatCards from "./components/StatCards";
import UserTable from "./components/UserTable";
const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();

  const {
    stats,
    users,
    setUsers,
    logs,
    loading,
  } = useAdminData(user, navigate);
  console.log("Stats in AdminDashboard:", stats);
  return (
    <div className="admin-dashboard">

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, monitor activities and system security.</p>
        </div>

        <button className="add-user-btn">
          + Add User
        </button>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />
      <UserTable
  users={users}
  setUsers={setUsers}
/>

    </div>
  );
};

export default AdminDashboard;