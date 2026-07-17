import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './layout/ProtectedRoute';
import NotFound from "./pages/NotFound";
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

    const load = () => {
      notificationsAPI
        .list()
        .then((r) =>
          setUnreadCount(r.data.filter((n) => !n.is_read).length)
        )
        .catch(() => {});
    };

    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [user]);

  return (
    <Layout unreadCount={unreadCount}>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/activity" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        <Route
          path="/files"
          element={<ProtectedRoute><Files /></ProtectedRoute>}
        />

        <Route
          path="/sharing"
          element={<ProtectedRoute><Sharing /></ProtectedRoute>}
        />

        <Route
          path="/activity"
          element={<ProtectedRoute><Activity /></ProtectedRoute>}
        />

        <Route
          path="/analytics"
          element={<ProtectedRoute><Analytics /></ProtectedRoute>}
        />

        <Route
          path="/notifications"
          element={<ProtectedRoute><Notifications /></ProtectedRoute>}
        />

        <Route
          path="/admin"
          element={<ProtectedRoute><Admin /></ProtectedRoute>}
        />

        <Route
          path="/settings"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}