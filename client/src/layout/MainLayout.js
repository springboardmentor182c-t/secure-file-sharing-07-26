import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";
import { useFetch } from "../hooks/useFetch";
import { getUsers, getDashboardStats } from "../features/dashboard/services/dashboardService";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users } = useFetch(getUsers, []);
  const { data: stats } = useFetch(getDashboardStats, []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = users?.find((u) => (u.role || "").toLowerCase().includes("admin")) || user || { name: "Admin User", role: "Admin", initials: "AU" };

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    fetch(`${API_BASE_URL}/users`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load user profile");
        return res.json();
      })
      .then(data => {
        const usersList = Array.isArray(data) ? data : data?.data || [];
        const current = usersList.find((u) => u.role?.toLowerCase().includes("admin")) || usersList[0] || data;
        if (current) {
          const initials = (current.full_name || current.name || "Admin User")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          setUser({ name: current.full_name || current.name || "Admin User", role: current.role || "Admin", initials: initials || "AU" });
        } else {
          setUser({ name: "Admin User", role: "Admin", initials: "AU" });
        }
      })
      .catch(() => {
        setUser({ name: "Admin User", role: "Admin", initials: "AU" });
      })
      .finally(() => {
        setLoading(false);
      });
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