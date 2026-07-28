import React, { createContext, useContext, useState } from 'react';

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Default user — no login required
  const user = {
    full_name: 'Alex Johnson',
    email: 'alex.johnson@secureshare.com',
    role: 'Admin',
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const logoutUser = () => {
    // No-op: auth removed
  };

  return (
    <AnalyticsContext.Provider value={{ user, theme, toggleTheme, logoutUser }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
