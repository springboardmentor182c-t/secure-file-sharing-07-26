import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";

import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload.jsx";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";

import NotificationFeature from "./features/notifications/NotificationFeature";
import Analytics from "./features/analytics/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./features/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
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

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
