import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './layout/ProtectedRoute';
import Layout from './layout/Layout';
import ScrollToTop from './layout/ScrollToTop';
import ThemeToggle from './components/ThemeToggle';
import PageTitle from './layout/PageTitle';
import { ToastProvider } from './layout/ToastProvider';

// Public pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';

// Protected pages
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Sharing from './pages/Sharing';
import SharedWithMe from './pages/SharedWithMe';
import Activity from './pages/Activity';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import { notificationsAPI } from './utils/api';
import './assets/global.css';

function AppShell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const load = () => {
      notificationsAPI
        .list()
        .then((r) => setUnreadCount(r.data.filter((n) => !n.is_read).length))
        .catch(() => {});
    };

    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [user]);

  return (
    <Layout unreadCount={unreadCount}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/files" element={<Files />} />
        <Route path="/sharing" element={<Sharing />} />
        <Route path="/shared-with-me" element={<SharedWithMe />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <PageTitle />
          <ThemeToggle />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth-callback" element={<OAuthCallback />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}