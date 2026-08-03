import React from "react";
<<<<<<< HEAD
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

// Pages
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import AdminDashboard from "./pages/AdminDashboard";

// Features
import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";
import Analytics from "./features/analytics/Analytics";

// Layout
import PageContainer from "./layout/PageContainer";

// Route Guards
import ProtectedRoute from "./features/authentication/components/ProtectedRoute";
import AdminRoute from "./features/authentication/components/AdminRoute";
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";
// Pages & Features

import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";

import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import Analytics from "./features/analytics/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
>>>>>>> origin/main-group-C

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
<<<<<<< HEAD
          element={<Navigate to="/login" replace />}
=======
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
          path="/settings"
          element={
            <PageContainer>
              <Settings />
            </PageContainer>
          }
        /> 

        <Route
          path="/upload"
          element={
            <PageContainer>
              <Upload />
            </PageContainer>
          }
        />

        <Route
          path="/files"
          element={
            <PageContainer>
              <Files />
            </PageContainer>
          }
        />

        <Route
          path="/users"
          element={
            <PageContainer>
              <Users />
            </PageContainer>
          }
        />

        <Route
          path="/activity"
          element={
            <PageContainer>
              <Activity />
            </PageContainer>
          }
        />

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
          path="/storage"
          element={
            <PageContainer>
              <Storage />
            </PageContainer>
          }
>>>>>>> origin/main-group-C
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/two-factor" element={<TwoFactorAuth />} />
        <Route path="/session-expired" element={<SessionExpired />} />
=======
         <Route path="/login" element={<Login />} /> 
>>>>>>> origin/main-group-C

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
<<<<<<< HEAD

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

        {/* Admin Authentication */}
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
            <ProtectedRoute>
              <PageContainer>
                <AdminDashboard />
              </PageContainer>
            </ProtectedRoute>
          }
        />

        {/* Invalid Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
=======

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
      <Dashboard />
    </PageContainer>
  }
/>

        {/* Auth Routes (Without Sidebar/Navbar) */}
        <Route path="/login" element={<Login />} /> 
        <Route path="/signup" element={<Signup />} />
>>>>>>> origin/main-group-C

      </Routes>
    </BrowserRouter>
  );
}

export default App;
