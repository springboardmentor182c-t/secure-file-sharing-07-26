import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PageContainer from "./layout/PageContainer";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";
import AdminDashboard from "./pages/AdminDashboard";

// Features
import NotificationFeature from "./features/notifications/NotificationFeature";
import Analytics from "./features/analytics/Analytics";
import Profile from "./features/profile/Profile";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <PageContainer title="Home">
              <Home />
            </PageContainer>
          }
        />

        <Route
          path="/admin"
          element={
            <PageContainer title="Dashboard">
              <AdminDashboard />
            </PageContainer>
          }
        />

        <Route
          path="/upload"
          element={
            <PageContainer title="Upload Files">
              <Upload />
            </PageContainer>
          }
        />

        <Route
          path="/files"
          element={
            <PageContainer title="Files">
              <Files />
            </PageContainer>
          }
        />

        <Route
          path="/users"
          element={
            <PageContainer title="Users">
              <Users />
            </PageContainer>
          }
        />

        <Route
          path="/activity"
          element={
            <PageContainer title="Activity">
              <Activity />
            </PageContainer>
          }
        />

        <Route
          path="/storage"
          element={
            <PageContainer title="Storage">
              <Storage />
            </PageContainer>
          }
        />

        <Route
          path="/sharing"
          element={
            <PageContainer title="Secure Sharing">
              <Securesharing />
            </PageContainer>
          }
        />

        <Route
          path="/settings"
          element={
            <PageContainer title="Settings">
              <Settings />
            </PageContainer>
          }
        />

        <Route
          path="/notifications"
          element={
            <PageContainer title="Notifications">
              <NotificationFeature />
            </PageContainer>
          }
        />

        <Route
          path="/analytics"
          element={
            <PageContainer title="Analytics">
              <Analytics />
            </PageContainer>
          }
        />

        <Route
          path="/profile"
          element={
            <PageContainer title="Profile">
              <Profile />
            </PageContainer>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;