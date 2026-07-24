import { api } from "../../lib/api";

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
}

export interface LoginResponse {
  mfa_required: boolean;
  mfa_token?: string | null;
  token?: Token | null;
  user?: User | null;
}

export const authService = {
  register(payload: { username: string; email: string; password: string }) {
    return api.post<User>("/auth/register", payload).then((r) => r.data);
  },

  login(payload: { email: string; password: string }) {
    return api.post<LoginResponse>("/auth/login", payload).then((r) => r.data);
  },

  verifyMfa(payload: { mfa_token: string; code: string }) {
    return api.post<LoginResponse>("/auth/mfa/verify", payload).then((r) => r.data);
  },

  setupMfa() {
    return api
      .post<{ secret: string; otpauth_url: string }>("/auth/mfa/setup")
      .then((r) => r.data);
  },

  enableMfa(code: string) {
    return api.post<{ message: string }>("/auth/mfa/enable", { code }).then((r) => r.data);
  },

  disableMfa() {
    return api.post<{ message: string }>("/auth/mfa/disable").then((r) => r.data);
  },

  getCurrentUser() {
    return api.get<User>("/auth/me").then((r) => r.data);
  },

  logout() {
    return api.post<{ message: string }>("/auth/logout").then((r) => r.data);
  },

  forgotPassword(email: string) {
    return api
      .post<{ message: string; reset_token?: string | null }>("/auth/forgot-password", { email })
      .then((r) => r.data);
  },

  resetPassword(payload: { token: string; new_password: string }) {
    return api.post<{ message: string }>("/auth/reset-password", payload).then((r) => r.data);
  },
};
