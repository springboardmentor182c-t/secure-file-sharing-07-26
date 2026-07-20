// client/src/features/analytics/components/panels/RecentActivityPanel.js
/**
 * Recent Activity feed with user filter — audit monitoring.
 * Powered by data.recent_activity.activities.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  LogIn, Upload, Download, Share2, Trash2, ShieldAlert, Activity,
} from "lucide-react";
import Card, { CardHeader } from "../shared/Card";
import Skeleton   from "../shared/Skeleton";
import EmptyState from "../shared/EmptyState";
import DateRangeDropdown from "../Header/DateRangeDropdown";

const EVENT_ICONS = {
  LOGIN:    LogIn,
  UPLOAD:   Upload,
  DOWNLOAD: Download,
  SHARE:    Share2,
  DELETE:   Trash2,
  SECURITY: ShieldAlert,
};

const EVENT_COLORS = {
  LOGIN:    "var(--an-kpi-emerald)",
  UPLOAD:   "var(--an-kpi-indigo)",
  DOWNLOAD: "var(--an-kpi-sky)",
  SHARE:    "var(--an-kpi-blue)",
  DELETE:   "var(--an-kpi-red)",
  SECURITY: "var(--an-kpi-amber)",
};

const EVENT_BG = {
  LOGIN:    "var(--an-kpi-emerald-bg)",
  UPLOAD:   "var(--an-kpi-indigo-bg)",
  DOWNLOAD: "var(--an-kpi-sky-bg)",
  SHARE:    "var(--an-kpi-blue-bg)",
  DELETE:   "var(--an-kpi-red-bg)",
  SECURITY: "var(--an-kpi-amber-bg)",
};

function timeAgo(iso) {
  const now  = new Date();
  const then = new Date(iso);
  const diff = (now - then) / 1000;

  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

export default function RecentActivityPanel({
  activities   = [],
  loading      = false,
  config       = {},
  users        = [],
  selectedUser = "",
  onUserChange,
}) {
  const title    = config.title      || "Recent Activity";
  const empty    = config.empty      || "No recent activity.";
  const allLabel = config.filter_all || "All users";

  // Build options list for the premium dropdown
  const userOptions = [
    { value: "", label: allLabel },
    ...users.map((u) => ({
      value: String(u.id),
      label: u.name || u.email,
    })),
  ];

  const UserFilter = () => (
    <div className="an-recent-filter">
      <DateRangeDropdown
        options={userOptions}
        value={String(selectedUser || "")}
        onChange={(val) => onUserChange && onUserChange(val)}
      />
    </div>
  );

  return (
    <Card delay={0.3} noPadding>
      <CardHeader
        title={title}
        right={!loading && users.length > 0 && <UserFilter />}
        borderBottom
      />

      {loading ? (
        <div className="an-recent-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="an-recent-skeleton">
              <Skeleton className="an-skeleton--icon-sm" />
              <div style={{ flex: 1 }}>
                <Skeleton style={{ width: "40%", height: 12 }} />
                <Skeleton style={{ width: "25%", height: 10, marginTop: 4 }} />
              </div>
              <Skeleton style={{ width: 50, height: 10 }} />
            </div>
          ))}
        </div>
      ) : !activities.length ? (
        <div className="an-recent-empty">
          <EmptyState message={empty} />
        </div>
      ) : (
        <div className="an-recent-list">
          {activities.map((a, i) => {
            const Icon  = EVENT_ICONS[a.event_type] || Activity;
            const color = EVENT_COLORS[a.event_type] || "var(--an-kpi-blue)";
            const bg    = EVENT_BG[a.event_type]    || "var(--an-kpi-blue-bg)";
            const isFailed = a.status === "FAILED";

            return (
              <motion.div
                key={a.id}
                className="an-recent-item"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x:  0 }}
                transition={{
                  duration: 0.3,
                  delay:    0.05 * i,
                  ease:     [0.32, 0.72, 0, 1],
                }}
              >
                <div
                  className="an-recent-icon"
                  style={{ background: bg, color }}
                >
                  <Icon size={14} />
                </div>

                <div className="an-recent-body">
                  <div className="an-recent-top">
                    <span className="an-recent-type">{a.event_type}</span>
                    {isFailed && (
                      <span className="an-recent-badge-failed">FAILED</span>
                    )}
                  </div>
                  <div className="an-recent-meta">
                    {a.user_id && <span>User #{a.user_id}</span>}
                    {a.file_id && <span> · File #{a.file_id}</span>}
                    {a.ip_address && <span> · {a.ip_address}</span>}
                  </div>
                </div>

                <div className="an-recent-time">{timeAgo(a.created_at)}</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}