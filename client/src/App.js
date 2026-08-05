import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PageContainer from "./layout/PageContainer";

// Authentication Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPVerification from "./pages/OTPVerification";
import EmailVerification from "./pages/EmailVerification";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import SessionExpired from "./pages/SessionExpired";

// Main Pages
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import AdminDashboard from "./pages/AdminDashboard";

// Features
import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";
import Analytics from "./features/analytics/Analytics";

// Route Guards
import ProtectedRoute from "./features/authentication/components/ProtectedRoute";
import AdminRoute from "./features/authentication/components/AdminRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/otp-verification"
          element={<OTPVerification />}
        />

        <Route
          path="/email-verification"
          element={<EmailVerification />}
        />

        <Route
          path="/two-factor"
          element={<TwoFactorAuth />}
        />

        <Route
          path="/session-expired"
          element={<SessionExpired />}
        />

        {/* Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageContainer>
                <Dashboard />
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

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageContainer>
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
              <PageContainer>
                <NotificationFeature />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Activity */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <PageContainer>
                <ActivityMonitorPage />
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
            <ProtectedRoute>
              <PageContainer>
                <Upload />
              </PageContainer>
            </ProtectedRoute>
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
            <ProtectedRoute>
              <PageContainer>
                <Users />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Storage */}
        <Route
          path="/storage"
          element={
            <ProtectedRoute>
              <PageContainer>
                <Storage />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Admin Home */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminHome />
            </AdminRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <PageContainer>
                <AdminDashboard />
              </PageContainer>
            </AdminRoute>
          }
        />

        {/* Invalid Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;