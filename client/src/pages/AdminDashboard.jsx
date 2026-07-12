import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { getUsers } from "../api/users";
import { getSummary, getStorageByUser } from "../api/stats";
import { getSystemHealth } from "../api/systemHealth";
import StatCard from "../components/StatCard";
import StorageChart from "../components/StorageChart";
import UserTable from "../components/UserTable";
import SystemHealthList from "../components/SystemHealthList";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminDashboard() {
  const { data: summary } = useFetch(getSummary);
  const { data: storage } = useFetch(getStorageByUser);
  const { data: users, refetch } = useFetch(getUsers);
  const { data: health } = useFetch(getSystemHealth);
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar users={users} />

      <div className="flex-1 overflow-y-auto">
        <Header
          title="Admin Dashboard"
          searchValue={search}
          onSearchChange={setSearch}
          onUserAdded={refetch}
        />

        <div className="p-6">
          {summary && (
            <div className="flex gap-4">
              <StatCard label="Total users" value={summary.total_users} sublabel={`${summary.active_users} active now`} />
              <StatCard label="Total storage used" value={`${summary.total_storage_gb} GB`} />
              <StatCard label="Files this month" value={summary.files_this_month} />
            </div>
          )}

          {storage && <StorageChart data={storage} />}
          {filteredUsers && <UserTable users={filteredUsers} />}
          {health && <SystemHealthList services={health} />}
        </div>
      </div>
    </div>
  );
}