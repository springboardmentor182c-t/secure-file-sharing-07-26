// client/src/features/analytics/components/views/SecurityView.js

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import KPIGrid            from "../kpi/KPIGrid";
import LoginLineChart     from "../charts/LoginLineChart";
import SecurityTimeline   from "../panels/SecurityTimeline";
import UnauthorizedTable  from "../panels/UnauthorizedTable";
import RecentActivityPanel from "../panels/RecentActivityPanel";
import SystemHealthPanel   from "../panels/SystemHealthPanel";
import { analyticsAPI }   from "../../../../utils/api";

const SECURITY_KPI_SKELETON_COUNT = 4;

export default function SecurityView({
  data,
  loading,
  uiConfig,
  onUserFilterChange,
  selectedUser,
}) {
  const [users, setUsers] = useState([]);

  const kpiConfig = uiConfig?.security_kpis || [];
  const chartsCfg = uiConfig?.charts        || {};
  const panelsCfg = uiConfig?.panels        || {};
  const severity  = uiConfig?.severity      || {};

  // Fetch users list once for the activity filter
  useEffect(() => {
    analyticsAPI
      .get("/api/analytics/users")
      .then((r) => setUsers(r.data.users || []))
      .catch(() => setUsers([]));
  }, []);

  const kpiData = {
    login_events:    data?.security?.login_events    ?? 0,
    failed_logins:   data?.security?.failed_logins   ?? 0,
    blocked_attacks: data?.security?.blocked_attacks ?? 0,
    security_events: data?.security?.security_events ?? 0,
  };

  return (
    <motion.div
      className="an-view"
      key="security"
      initial={{ opacity: 0, y:  8 }}
      animate={{ opacity: 1, y:  0 }}
      exit={{    opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <KPIGrid
        config={kpiConfig}
        data={kpiData}
        skeletonCount={SECURITY_KPI_SKELETON_COUNT}
        loading={loading}
      />

      <div className="an-row an-row--3-2">
        <LoginLineChart
          loginActivity={data?.security?.login_activity}
          loading={loading}
          config={chartsCfg.login}
        />
        <SecurityTimeline
          events={data?.security?.events}
          loading={loading}
          config={panelsCfg.timeline}
          severity={severity}
        />
      </div>

      <UnauthorizedTable
        attempts={data?.security?.unauthorized_attempts}
        loading={loading}
        config={panelsCfg.unauthorized}
      />

      {/* NEW: Recent Activity + System Health */}
      <div className="an-row an-row--3-2">
        <RecentActivityPanel
          activities={data?.recent_activity?.activities}
          loading={loading}
          config={panelsCfg.recent_activity}
          users={users}
          selectedUser={selectedUser}
          onUserChange={onUserFilterChange}
        />
        <SystemHealthPanel
          stats={data?.system_stats}
          loading={loading}
          config={panelsCfg.system_stats}
        />
      </div>
    </motion.div>
  );
}