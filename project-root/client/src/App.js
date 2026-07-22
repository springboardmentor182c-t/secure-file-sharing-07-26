import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './layout/ProtectedRoute';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsAPI.list()
      .then(res => {
        const items = res.data || [];
        setUnreadCount(items.filter(n => !n.read).length);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <div className="main-area">
        <Navbar unreadCount={unreadCount} />
        <main className="page-body">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />

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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AnalyticsProvider>
  );
}
