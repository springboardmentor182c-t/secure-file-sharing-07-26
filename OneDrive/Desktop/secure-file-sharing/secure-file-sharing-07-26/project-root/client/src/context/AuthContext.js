import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI.me()
        .then(({ data }) => setUser(data))
        .catch(() => { localStorage.clear(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const finishLogin = useCallback((data) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password);
    if (data.mfa_required) return { mfaRequired: true, mfaToken: data.mfa_token };
    return { user: finishLogin(data) };
  }, [finishLogin]);

  const verifyMfa = useCallback(async (mfaToken, code) => {
    const { data } = await authAPI.mfaVerify(mfaToken, code);
    return finishLogin(data);
  }, [finishLogin]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.signup(name, email, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyMfa, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
