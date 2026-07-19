import { useState } from "react";
import { Outlet } from "react-router-dom";
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

  const currentUser = users?.find((u) => u.role === "Admin") || null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#1E1F2B]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} users={users} stats={stats} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          setSidebarOpen={setSidebarOpen}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUser={currentUser}
        />
        <PageContainer>
          <Outlet context={{ searchTerm }} />
        </PageContainer>
      </div>
    </div>
  );
}

export default MainLayout;