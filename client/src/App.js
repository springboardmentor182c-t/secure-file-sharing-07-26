import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Authentication Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPVerification from "./pages/OTPVerification";
import EmailVerification from "./pages/EmailVerification";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import SessionExpired from "./pages/SessionExpired";

// Dashboard Pages
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";

// Features
import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";

// Layout
import PageContainer from "./layout/PageContainer";

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

        {/* Activity Monitor */}
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

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminHome />
            </AdminRoute>
          }
        />

        {/* Invalid Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;