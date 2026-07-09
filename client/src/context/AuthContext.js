import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest, setAccessToken } from "../utils/apiClient";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  verifyMfa,
} from "../features/authentication/services/authService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  // On app load: try to silently refresh using the httpOnly cookie.
  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest("/api/auth/refresh", { method: "POST", skipAuth: true });
        setAccessToken(data.access_token);
        await refreshUser();
      } catch {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      const res = await loginUser(email, password);
      if (res.mfa_required) {
        return { mfaRequired: true, mfaToken: res.mfa_token };
      }
      setAccessToken(res.access_token);
      await refreshUser();
      return { mfaRequired: false };
    },
    [refreshUser]
  );

  const completeMfa = useCallback(
    async (mfaToken, code) => {
      const res = await verifyMfa(mfaToken, code);
      setAccessToken(res.access_token);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    await logoutUser().catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, completeMfa, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
