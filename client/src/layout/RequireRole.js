import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Role-Based Access Control (RBAC) Route Guard Component.
 * Restricts rendering of child routes to users with approved roles.
 *
 * @param {Array<string>} allowedRoles - List of authorized roles (e.g., ["Admin", "Editor"])
 * @param {Object} user - Active user session object
 */
export function RequireRole({ allowedRoles = [], user }) {
  if (!user) {
    // Session is loading or unauthenticated
    return null;
  }

  const userRole = (user.role || "").toLowerCase();
  const isAuthorized = allowedRoles.some(role => role.toLowerCase() === userRole);

  if (!isAuthorized) {
    console.warn(`[RBAC] Access denied for user role '${user.role}' to restricted route.`);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RequireRole;
