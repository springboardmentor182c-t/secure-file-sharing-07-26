import { apiRequest } from "../../../utils/apiClient";
import { API_BASE_URL } from "../../../data/constants";

export function registerUser(fullName, email, password) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: { full_name: fullName, email, password },
    skipAuth: true,
  });
}

export function loginUser(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export function verifyMfa(mfaToken, code) {
  return apiRequest("/api/auth/mfa/verify", {
    method: "POST",
    body: { mfa_token: mfaToken, code },
    skipAuth: true,
  });
}

export function logoutUser() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export function fetchCurrentUser() {
  return apiRequest("/api/auth/me");
}

export function forgotPassword(email) {
  return apiRequest("/api/auth/password/forgot", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export function resetPassword(token, newPassword) {
  return apiRequest("/api/auth/password/reset", {
    method: "POST",
    body: { token, new_password: newPassword },
    skipAuth: true,
  });
}

export function setupMfa() {
  return apiRequest("/api/auth/mfa/setup", { method: "POST" });
}

export function enableMfa(code) {
  return apiRequest("/api/auth/mfa/enable", { method: "POST", body: { code } });
}

export function disableMfa(password) {
  return apiRequest("/api/auth/mfa/disable", { method: "POST", body: { password } });
}

export function listSessions() {
  return apiRequest("/api/auth/sessions");
}

export function revokeSession(sessionId) {
  return apiRequest(`/api/auth/sessions/${sessionId}`, { method: "DELETE" });
}

export function oauthLoginUrl(provider) {
  return `${API_BASE_URL}/api/auth/oauth/${provider}/login`;
}
