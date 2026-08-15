import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageContainer from "./PageContainer";
import ScrollToTopButton from "./ScrollToTopButton";
import ConnectionStatus from "./ConnectionStatus";
import SessionTimeout from "./SessionTimeout";
import LoadingBar from "./LoadingBar";
import KeyboardShortcuts from "./KeyboardShortcuts";
import FaviconBadge from "./FaviconBadge";
import NotificationSound from "./NotificationSound";
import AssistantBubble from '../features/assistant/AssistantBubble';
import { motion } from "framer-motion";
import "./Layout.css";

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Layout({ children, unreadCount = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("sidebar-collapsed") === "true"
  );

  const handleToggleCollapse = (value) => {
    setSidebarCollapsed(value);
    localStorage.setItem("sidebar-collapsed", value);
  };

  return (
    <div className="app-shell">
      {/* Global utilities */}
      <LoadingBar />
      <SessionTimeout />
      <KeyboardShortcuts />
      <FaviconBadge count={unreadCount} />
      <NotificationSound count={unreadCount} />

      <Sidebar
        unreadCount={unreadCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={handleToggleCollapse}
      />

      <div
        className={`main-area ${sidebarCollapsed ? "main-area-collapsed" : ""}`}
      >
        <Navbar
          unreadCount={unreadCount}
          setSidebarOpen={setSidebarOpen}
          connectionStatus={<ConnectionStatus />}
        />
        <PageContainer>
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="show"
          >
            {children}
          </motion.div>
        </PageContainer>
      </div>

      <ScrollToTopButton />
      <AssistantBubble /> 
    </div>
  );
}