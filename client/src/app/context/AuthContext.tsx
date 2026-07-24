import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tokenStorage, setUnauthorizedHandler, getApiErrorMessage } from "../lib/api";
import { authService, type User } from "../features/auth/authService";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean; mfaToken?: string | null }>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; devResetToken?: string | null }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // On first mount, if a token is already in localStorage, try to restore
  // the session by fetching the current user (persistent login).
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  // Any 401 from the API (expired/invalid token) should drop us back to a
  // signed-out state everywhere in the app.
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.mfa_required) {
      return { mfaRequired: true, mfaToken: res.mfa_token };
    }
    if (res.token) {
      tokenStorage.setTokens(res.token.access_token, res.token.refresh_token);
      setUser(res.user ?? null);
    }
    return { mfaRequired: false };
  }, []);

  const verifyMfa = useCallback(async (mfaToken: string, code: string) => {
    const res = await authService.verifyMfa({ mfa_token: mfaToken, code });
    if (res.token) {
      tokenStorage.setTokens(res.token.access_token, res.token.refresh_token);
      setUser(res.user ?? null);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    await authService.register({ username, email, password });
    // Registration doesn't log the user in automatically on the backend, so
    // immediately sign in with the same credentials for a seamless flow.
    const res = await authService.login({ email, password });
    if (res.token) {
      tokenStorage.setTokens(res.token.access_token, res.token.refresh_token);
      setUser(res.user ?? null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokenStorage.getAccessToken()) {
        await authService.logout();
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await authService.forgotPassword(email);
    return { message: res.message, devResetToken: res.reset_token };
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await authService.resetPassword({ token, new_password: newPassword });
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const u = await authService.getCurrentUser();
    setUser(u);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      verifyMfa,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      refreshCurrentUser,
    }),
    [user, isLoading, login, verifyMfa, signup, logout, forgotPassword, resetPassword, refreshCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { getApiErrorMessage };
