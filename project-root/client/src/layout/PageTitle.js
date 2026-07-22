// client/src/layout/PageTitle.js
/**
 * Updates browser tab title based on current route.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_TITLES = {
  "/dashboard":      "Dashboard",
  "/files":          "My Files",
  "/sharing":        "Sharing",
  "/shared-with-me": "Shared with Me",
  "/activity":       "Activity",
  "/notifications":  "Notifications",
  "/analytics":      "Analytics",
  "/admin":          "Admin",
  "/settings":       "Settings",
  "/login":          "Sign In",
  "/signup":         "Create Account",
  "/verify-otp":     "Verify OTP",
  "/forgot-password":"Forgot Password",
  "/reset-password": "Reset Password",
};

const APP_NAME = "TrustShare";

export default function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Find matching route (exact or partial)
    const matchedKey = Object.keys(ROUTE_TITLES).find((key) =>
      pathname.startsWith(key)
    );

    const pageTitle = matchedKey
      ? ROUTE_TITLES[matchedKey]
      : "Page Not Found";

    document.title = `${pageTitle} — ${APP_NAME}`;
  }, [pathname]);

  return null;
}