import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import PageContainer from './layout/PageContainer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import Files from './pages/Files';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAnalytics();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAnalytics();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Loading session...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/files" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <PageContainer>
      <Routes>
        {/* Root → redirect straight to Files */}
        <Route path="/" element={<Navigate to="/files" replace />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <Files />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageContainer>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AnalyticsProvider>
  );
}
