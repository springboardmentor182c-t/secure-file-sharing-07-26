import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";

// Pages & Features
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Security from "./pages/Security";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./features/dashboard/Dashboard";

// Activity Monitor
import ActivityMonitorPage from "./pages/ActivityMonitorPage";

// Analytics
import Analytics from "./features/analytics/Analytics";

// Notifications
import NotificationFeature from "./features/notifications/NotificationFeature";

// Admin
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <PageContainer>
              <Home />
            </PageContainer>
          }
        />

        <Route
          path="/sharing"
          element={
            <PageContainer>
              <Securesharing />
            </PageContainer>
          }
        />

        <Route
          path="/security"
          element={
            <PageContainer>
              <Security />
            </PageContainer>
          }
        />

        <Route
          path="/settings"
          element={
            <PageContainer>
              <Settings />
            </PageContainer>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <PageContainer>
              <Dashboard />
            </PageContainer>
          }
        />

        <Route
          path="/notifications"
          element={
            <PageContainer>
              <NotificationFeature />
            </PageContainer>
          }
        />

        <Route
          path="/activity"
          element={
            <PageContainer>
              <ActivityMonitorPage />
            </PageContainer>
          }
        />

        <Route
          path="/analytics"
          element={
            <PageContainer>
              <Analytics />
            </PageContainer>
          }
        />

        <Route
          path="/admin"
          element={
            <PageContainer>
              <AdminDashboard />
            </PageContainer>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;