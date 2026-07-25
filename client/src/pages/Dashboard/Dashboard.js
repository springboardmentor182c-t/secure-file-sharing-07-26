import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import StatCard from "../../components/Admin/StatCard";
import StorageUtilizationChart from "../../components/Admin/StorageUtilizationChart";
import UserManagementTable from "../../components/Admin/UserManagementTable";
import SystemMonitoring from "../../components/Admin/SystemMonitoring";
import InviteUserModal from "../../components/Modals/InviteUserModal";
import { useFetch } from "../../hooks/useFetch";
import {
  getDashboardStats,
  getStorageByUser,
  getUsers,
  getMonitoring,
} from "../../features/dashboard/services/dashboardService";

export default function Dashboard() {
  const { searchTerm } = useOutletContext();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: stats, error: statsError, refetch: refetchStats } = useFetch(getDashboardStats, []);
  const { data: storageData, loading: storageLoading, error: storageError, refetch: refetchStorage } = useFetch(getStorageByUser, []);
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useFetch(getUsers, []);
  const { data: services, loading: servicesLoading, error: servicesError } = useFetch(getMonitoring, []);

  const filteredUsers = (users || []).filter((u) => {
    const term = (searchTerm || "").toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <button
          onClick={() => setInviteOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 transition text-white text-sm font-medium px-4 py-2.5 rounded-xl"
        >
          + Invite user
        </button>
      </div>

      {(statsError || storageError || usersError || servicesError) && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          Could not reach the backend API. Make sure the FastAPI server is running on port 8000.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={stats ? stats.total_users : "..."} subtext={stats ? `${stats.active_users} active now` : ""} />
        <StatCard label="Total storage used" value={stats ? `${stats.total_storage_gb.toFixed(2)} GB` : "..."} />
        <StatCard label="Files this month" value={stats ? stats.files_this_month : "..."} />
        <StatCard label="Share links active" value={stats ? stats.active_share_links : "..."} />
      </div>

      <div className="bg-[#171826] border border-gray-800 rounded-xl p-6">
  <h2 className="text-white font-semibold mb-4">Storage utilization by user</h2>
  {storageData ? (
    <StorageUtilizationChart data={storageData} maxScale={stats?.total_storage_limit_gb || 1000} />
  ) : (
    <p className="text-gray-500 text-sm">{storageLoading ? "Loading..." : "No data available."}</p>
  )}
</div>

      <div>
        <h2 className="text-white font-semibold mb-4">
          User management {searchTerm && <span className="text-gray-500 text-sm font-normal">— filtered by "{searchTerm}"</span>}
        </h2>
        {users ? <UserManagementTable users={filteredUsers} /> : <p className="text-gray-500 text-sm">{usersLoading ? "Loading..." : "No data available."}</p>}
      </div>

      <div>
        <h2 className="text-white font-semibold mb-4">System monitoring</h2>
        {services ? <SystemMonitoring services={services} /> : <p className="text-gray-500 text-sm">{servicesLoading ? "Loading..." : "No data available."}</p>}
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => {
          setInviteOpen(false);
          refetchUsers();
          refetchStats();
          refetchStorage();
        }}
      />
    </div>
  );
}