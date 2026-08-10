import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import ProtectedRoute from './layout/ProtectedRoute';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
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
import PublicShare from './pages/PublicShare';
import { notificationsAPI } from './utils/api';
import './assets/global.css';

// AppShell: wraps protected pages with layout chrome.
function AppShell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed]     = useState(false);
  const realtime = useRealtime();

  useEffect(() => {
    notificationsAPI.list()
      .then(res => {
        if (res.data?.unread !== undefined) {
          setUnreadCount(res.data.unread);
        } else {
          const items = Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
          setUnreadCount(items.filter(n => !n.read).length);
        }
      })
      .catch(() => {});
  }, []);

  // Real-time unread counter updates
  useEffect(() => {
    if (!realtime?.subscribe) return;

    const unsubNew = realtime.subscribe('notification_new', (notif) => {
      if (!notif.read) {
        setUnreadCount((c) => c + 1);
      }
    });

    const unsubUpd = realtime.subscribe('notification_updated', (data) => {
      if (data.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    });

    const unsubAll = realtime.subscribe('notification_all_read', () => {
      setUnreadCount(0);
    });

    return () => {
      unsubNew();
      unsubUpd();
      unsubAll();
    };
  }, [realtime]);

  const sidebarW = collapsed ? 68 : 240;

  return (
    <div className="app-shell">
      <Sidebar
        unreadCount={unreadCount}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <div className="main-area" style={{ marginLeft: sidebarW }}>
        <Navbar unreadCount={unreadCount} />
        <main className="page-body">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/files"         element={<Files />} />
            <Route path="/encryption"    element={<Encryption />} />
            <Route path="/sharing"       element={<Sharing />} />
            <Route path="/analytics"     element={<Analytics />} />
            <Route path="/activity"      element={<ActivityLogs />} />
            <Route path="/notifications" element={<Notifications onUnreadChange={setUnreadCount} />} />
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
        <RealtimeProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login"           element={<Login />} />
              <Route path="/signup"          element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/oauth/callback"  element={<OAuthCallback />} />
              <Route path="/share/:token"    element={<PublicShare />} />

              {/* Protected shell routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect to Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </RealtimeProvider>
      </AuthProvider>
    </AnalyticsProvider>
  );
}
