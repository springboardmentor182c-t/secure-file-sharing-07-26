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

// AppShell: wraps protected pages with layout chrome.
// Currently Files.js has its own self-contained nav/sidebar,
// so AppShell just renders the matched child route directly.
function AppShell() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/files" replace />} />
    </Routes>
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
