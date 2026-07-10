import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './layout/ProtectedRoute';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Sharing from './pages/Sharing';
import Activity from './pages/Activity';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import { notificationsAPI } from './utils/api';
import Layout from './layout/Layout';
import './assets/global.css';

function AppShell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = () => notificationsAPI.list().then(r => setUnreadCount(r.data.filter(n => !n.is_read).length)).catch(() => {});
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [user]);

  return (
  <Layout unreadCount={unreadCount}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files" element={<Files />} />
      <Route path="/sharing" element={<Sharing />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Layout>
);
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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
    </AuthProvider>
  );
}
