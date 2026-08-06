import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import StatCard from "../../components/Admin/StatCard";
import StorageUtilizationChart from "../../components/Admin/StorageUtilizationChart";
import UserManagementTable from "../../components/Admin/UserManagementTable";
import InviteUserModal from "../../components/Modals/InviteUserModal";
import { useFetch } from "../../hooks/useFetch";
import { Radio } from "lucide-react";
import {
  getDashboardStats,
  getStorageByUser,
  getUsers,
} from "../../features/dashboard/services/dashboardService";

export default function Dashboard() {
  const { searchTerm } = useOutletContext();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { data: stats, error: statsError, refetch: refetchStats } = useFetch(getDashboardStats, []);
  const { data: storageData, loading: storageLoading, error: storageError, refetch: refetchStorage } = useFetch(getStorageByUser, []);
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useFetch(getUsers, []);

  // 5-Second Real-Time Live Polling
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());

    const interval = setInterval(() => {
      refetchStats();
      refetchStorage();
      refetchUsers();
      setLastUpdated(new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredUsers = (users || []).filter((u) => {
    const term = (searchTerm || "").toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-400">Live real-time platform statistics & user storage metrics.</p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
            <Radio size={14} className="animate-pulse text-green-400" /> Live Updates {lastUpdated && `(${lastUpdated})`}
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            className="bg-[#7C5CFC] hover:bg-[#6847EC] transition text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-lg shadow-[#7C5CFC]/20"
          >
            + Invite user
          </button>
        </div>
      </div>

      {(statsError || storageError || usersError) && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          Could not reach the backend API. Make sure the FastAPI server is running on port 8000.
        </div>
      )}

      {/* Real-time Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={stats ? stats.total_users : "..."} subtext={stats ? `${stats.active_users} active now` : ""} />
        <StatCard label="Total storage used" value={stats ? `${stats.total_storage_gb.toFixed(3)} GB` : "..."} />
        <StatCard label="Files this month" value={stats ? stats.files_this_month : "..."} />
        <StatCard label="Share links active" value={stats ? stats.active_share_links : "..."} />
      </div>

      {/* Storage Utilization Chart */}
      <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6 shadow-xl">
        <h2 className="text-white font-semibold mb-4 text-sm">Storage utilization by user</h2>
        {storageData ? (
          <StorageUtilizationChart data={storageData} maxScale={stats?.total_storage_limit_gb || 1000} />
        ) : (
          <p className="text-gray-500 text-sm">{storageLoading ? "Loading live storage data..." : "No user storage recorded."}</p>
        )}
      </div>

      {/* User Management Table */}
      <div>
        <h2 className="text-white font-semibold mb-4">
          User management {searchTerm && <span className="text-gray-500 text-sm font-normal">— filtered by "{searchTerm}"</span>}
        </h2>
        {users ? <UserManagementTable users={filteredUsers} onUserUpdated={() => { refetchUsers(); refetchStats(); refetchStorage(); }} /> : <p className="text-gray-500 text-sm">{usersLoading ? "Loading registered users..." : "No users found."}</p>}
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