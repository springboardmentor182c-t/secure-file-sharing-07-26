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
import Security from "./pages/Security";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";

// Features
import NotificationFeature from "./features/notifications/NotificationFeature";
import Analytics from "./features/analytics/Analytics";

// Route Guards
import ProtectedRoute from "./features/authentication/components/ProtectedRoute";
import AdminRoute from "./features/authentication/components/AdminRoute";

// Profile
import Profile from "./features/profile/Profile";
import AdminDashboard from "./pages/AdminDashboard";

// File Management
import FileManagementPage from "./filemanagement/FileManagementPage";
import FileDetailsPage from "./filemanagement/FileDetailsPage";

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
            <ProtectedRoute>
              <PageContainer title="Dashboard">
                <AdminDashboard />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Secure Sharing */}
        <Route
          path="/sharing"
          element={
            <ProtectedRoute>
              <PageContainer>
                <Securesharing />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Encryption & Security */}
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <PageContainer>
                <Security />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageContainer title="Settings">
                <Settings />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <PageContainer title="Notifications">
                <NotificationFeature />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <PageContainer>
                <Analytics />
              </PageContainer>
            </ProtectedRoute>
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
            <ProtectedRoute>
              <PageContainer>
                <Files />
              </PageContainer>
            </ProtectedRoute>
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

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageContainer title="Profile">
                <Profile />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* File Management */}
        <Route
          path="/file-management"
          element={
            <ProtectedRoute>
              <PageContainer>
                <FileManagementPage />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* File Details */}
        <Route
          path="/file-management/:id"
          element={
            <ProtectedRoute>
              <PageContainer>
                <FileDetailsPage />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Invalid Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;