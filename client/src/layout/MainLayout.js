import { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";


function MainLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_BASE_URL}/api/users/me`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load user profile");
        return res.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(err => {
        console.error("Error loading user session:", err);
        setUser({ name: "Guest User", role: "Viewer", initials: "GU" });
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

  // Define routes requiring admin privileges
  const isSecurityRoute = ["/security", "/monitoring", "/audit"].includes(location.pathname);
  const isAdmin = user?.role?.toLowerCase().includes("admin");

  if (isSecurityRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (

    <div className="flex h-screen overflow-hidden bg-[#1E1F2B]">


      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />


      <div className="flex flex-1 flex-col overflow-hidden">


        <Header
          setSidebarOpen={setSidebarOpen}
          user={user}
        />


        <PageContainer>

          <Outlet />

        </PageContainer>


      </div>


    </div>

  );
}


export default MainLayout;