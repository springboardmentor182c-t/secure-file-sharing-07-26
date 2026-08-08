import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PageContainer from "./layout/PageContainer";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPVerification from "./pages/OTPVerification";
import EmailVerification from "./pages/EmailVerification";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import SessionExpired from "./pages/SessionExpired";

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

        {/* Authentication Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
        <Route path="/session-expired" element={<SessionExpired />} />

        {/* Home */}
        <Route
          path="/home"
          element={
            <PageContainer title="Home">
              <Home />
            </PageContainer>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <PageContainer title="Dashboard">
              <AdminDashboard />
            </PageContainer>
          }
        />

        {/* Upload */}
        <Route
          path="/upload"
          element={
            <PageContainer title="Upload Files">
              <Upload />
            </PageContainer>
          }
        />

        {/* Files */}
        <Route
          path="/files"
          element={
            <PageContainer title="Files">
              <Files />
            </PageContainer>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <PageContainer title="Users">
              <Users />
            </PageContainer>
          }
        />

        {/* Activity */}
        <Route
          path="/activity"
          element={
            <PageContainer title="Activity">
              <Activity />
            </PageContainer>
          }
        />

        {/* Storage */}
        <Route
          path="/storage"
          element={
            <PageContainer title="Storage">
              <Storage />
            </PageContainer>
          }
        />

        {/* Secure Sharing */}
        <Route
          path="/sharing"
          element={
            <PageContainer title="Secure Sharing">
              <Securesharing />
            </PageContainer>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <PageContainer title="Settings">
              <Settings />
            </PageContainer>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <PageContainer title="Notifications">
              <NotificationFeature />
            </PageContainer>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <PageContainer title="Analytics">
              <Analytics />
            </PageContainer>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <PageContainer title="Profile">
              <Profile />
            </PageContainer>
          }
        />

        {/* Invalid route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;