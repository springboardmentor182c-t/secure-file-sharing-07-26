import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageContainer from "./PageContainer";
import "./Layout.css";

export default function Layout({ children, unreadCount = 0 }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

useEffect(() => {
  if (darkMode) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [darkMode]);

  return (
    <div className="app-shell">

      <Sidebar
        unreadCount={unreadCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-area">

        <Navbar
    unreadCount={unreadCount}
    setSidebarOpen={setSidebarOpen}
    darkMode={darkMode}
    setDarkMode={setDarkMode}
/>

        <PageContainer>
          {children}
        </PageContainer>

      </div>

    </div>
  );
}