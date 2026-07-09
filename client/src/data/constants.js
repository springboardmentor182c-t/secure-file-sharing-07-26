export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  OAUTH_CALLBACK: "/oauth/callback",
  DASHBOARD: "/dashboard",
};

export const OAUTH_PROVIDERS = {
  GOOGLE: "google",
  MICROSOFT: "microsoft",
};

export const MFA_CODE_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 8;
