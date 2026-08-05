// client/src/layout/PageTitle.js

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_TITLES = {
  "/dashboard":       "Dashboard",
  "/files":           "My Files",
  "/sharing":         "Sharing",
  "/shared-with-me":  "Shared with Me",
  "/activity":        "Activity",
  "/notifications":   "Notifications",
  "/analytics":       "Analytics",
  "/assistant":       "AI Assistant",
  "/admin":           "Admin",
  "/settings":        "Settings",
  "/login":           "Sign In",
  "/signup":          "Create Account",
  "/verify-otp":      "Verify OTP",
  "/forgot-password": "Forgot Password",
  "/reset-password":  "Reset Password",
};

const APP_NAME = "TrustShare";

export default function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    // FIX ISS-L5: Exact match first
    if (ROUTE_TITLES[pathname]) {
      document.title = `${ROUTE_TITLES[pathname]} — ${APP_NAME}`;
      return;
    }

    // Partial match — longest key wins to prevent collision
    // e.g. /files/shared → matches /files correctly
    const matchedKey = Object.keys(ROUTE_TITLES)
      .sort((a, b) => b.length - a.length)
      .find((key) => pathname.startsWith(key));

    const pageTitle = matchedKey
      ? ROUTE_TITLES[matchedKey]
      : "Page Not Found";

    document.title = `${pageTitle} — ${APP_NAME}`;
  }, [pathname]);

  return null;
}