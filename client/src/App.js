import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import PageContainer from "./layout/PageContainer";

// Group-C pages/features
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import AdminDashboard from "./pages/AdminDashboard";

// File Management
import FileManagementPage from "./filemanagement/FileManagementPage";
import FileDetailsPage from "./filemanagement/FileDetailsPage";

// File Management CSS
import "./assets/css/layout.css";
import "./assets/css/sidebar.css";
import "./assets/css/header.css";
import "./assets/css/folders.css";
import "./assets/css/table.css";
import "./assets/css/fileDetails.css";
import "./assets/css/responsive.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            <PageContainer>
              <Home />
            </PageContainer>
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PageContainer>
              <Dashboard />
            </PageContainer>
          }
        />

        {/* SECURE SHARING */}
        <Route
          path="/sharing"
          element={
            <PageContainer>
              <Securesharing />
            </PageContainer>
          }
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <PageContainer>
              <NotificationFeature />
            </PageContainer>
          }
        />

        {/* ACTIVITY MONITOR */}
        <Route
          path="/activity"
          element={
            <PageContainer>
              <ActivityMonitorPage />
            </PageContainer>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <PageContainer>
              <Settings />
            </PageContainer>
          }
        />

        {/* FILE MANAGEMENT */}
        <Route
          path="/files"
          element={<FileManagementPage />}
        />

        <Route
          path="/file-details"
          element={<FileDetailsPage />}
        />

        {/* AUTHENTICATION */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;