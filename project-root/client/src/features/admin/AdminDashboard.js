import React from "react";
import "./admin.css";
import StatCards from "./components/StatCards";
import UserTable from "./components/UserTable";
const AdminDashboard = () => {
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
      <StatCards />
      <UserTable />

    </div>
  );
};

export default AdminDashboard;