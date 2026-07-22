// client/src/layout/Breadcrumbs.js
/**
 * Auto-generated breadcrumbs from the current route.
 * Place inside PageHeader or at top of any page.
 *
 * Usage:
 *   <Breadcrumbs />
 *   <Breadcrumbs items={[{ label: "Custom", to: "/custom" }]} />
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import "./Breadcrumbs.css";

// Route → display name mapping
const ROUTE_LABELS = {
  dashboard: "Dashboard",
  files: "My Files",
  sharing: "Sharing",
  "shared-with-me": "Shared with Me",
  activity: "Activity",
  notifications: "Notifications",
  analytics: "Analytics",
  admin: "Admin",
  settings: "Settings",
};

export default function Breadcrumbs({ items }) {
  const location = useLocation();

  // Auto-generate from route if no custom items
  const breadcrumbs =
    items ||
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment, i, arr) => ({
        label: ROUTE_LABELS[segment] || segment.replace(/-/g, " "),
        to: "/" + arr.slice(0, i + 1).join("/"),
      }));

  // Don't show if only one level (or on dashboard)
  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/dashboard" className="breadcrumbs-home" title="Dashboard">
        <Home size={13} />
      </Link>

      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1;
        return (
          <motion.div
            key={crumb.to}
            className="breadcrumbs-item"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <ChevronRight size={12} className="breadcrumbs-separator" />
            {isLast ? (
              <span className="breadcrumbs-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="breadcrumbs-link">
                {crumb.label}
              </Link>
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}