import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnalyticsProvider } from './context/AnalyticsContext';
import Files from './pages/Files';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AnalyticsProvider>
      <Router>
        <Routes>
          <Route path="/"        element={<Navigate to="/files" replace />} />
          <Route path="/files"   element={<Files />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*"        element={<Navigate to="/files" replace />} />
        </Routes>
      </Router>
    </AnalyticsProvider>
  );
}
