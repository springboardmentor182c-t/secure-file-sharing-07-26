import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";
import { useFetch } from "../hooks/useFetch";
import { getUsers, getDashboardStats } from "../features/dashboard/services/dashboardService";
import { getStoredUser } from "../features/authentication/services/authStorage";
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users } = useFetch(getUsers, []);
  const { data: stats } = useFetch(getDashboardStats, []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = user || { name: "Guest", role: "Viewer", initials: "G" };

  useEffect(() => {
    const current = getStoredUser();
    if (current) {
      const name = current.full_name || current.name || "User";
      const initials = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      setUser({ name, role: current.role || "Viewer", initials: initials || "U" });
    } else {
      setUser({ name: "Guest", role: "Viewer", initials: "G" });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1E1F2B] text-white">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#7C5CFC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#1E1F2B]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} users={users} stats={stats} currentUser={user || currentUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          setSidebarOpen={setSidebarOpen}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUser={user || currentUser}
        />
        <PageContainer>
          <Outlet context={{ searchTerm }} />
        </PageContainer>
      </div>
    </div>
  );
}

export default MainLayout;