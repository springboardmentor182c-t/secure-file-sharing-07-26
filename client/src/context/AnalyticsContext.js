import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load user profile when token is set
  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data.theme) {
          setTheme(data.theme);
        }
      } else {
        // Token is invalid/expired — clear session
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchUserProfile]);

  const loginUser = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    
    // If logged in, update preferences in database
    if (user && token) {
      try {
        await fetch('/api/users/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: nextTheme })
        });
      } catch (err) {
        console.error("Failed to sync theme preference with server:", err);
      }
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    theme,
    loginUser,
    logoutUser,
    refreshUser,
    toggleTheme
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
