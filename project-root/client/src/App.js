import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './layout/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Encryption from './pages/Encryption';
import Sharing from './pages/Sharing';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import { notificationsAPI } from './utils/api';
import './assets/global.css';

// AppShell: wraps protected pages with layout chrome.
// Currently Files.js has its own self-contained nav/sidebar,
// so AppShell just renders the matched child route directly.
function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-area">
        <Navbar unreadCount={unreadCount} />
        <main className="page-body">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/files"         element={<Files />} />
            <Route path="/encryption"    element={<Encryption />} />
            <Route path="/sharing"       element={<Sharing />} />
            <Route path="/analytics"     element={<Analytics />} />
            <Route path="/activity"      element={<ActivityLogs />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin"         element={<Admin />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="*"              element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/oauth/callback"  element={<OAuthCallback />} />

            {/* Main app — Files page (has its own full layout) */}
            <Route path="/files" element={<Files />} />

            {/* Protected shell routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/files" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AnalyticsProvider>
  );
}
