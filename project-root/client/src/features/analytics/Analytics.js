// client/src/features/analytics/Analytics.js

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import useAnalytics       from "./hooks/useAnalytics";
import Header             from "./components/Header/Header";
import FileAnalyticsView  from "./components/views/FileAnalyticsView";
import SecurityView       from "./components/views/SecurityView";
import "./analytics.css";
import ScrollToTop from "./components/shared/ScrollToTop";

const DATE_RANGE_TO_DAYS = {
  "7days":  7,
  "30days": 30,
  "90days": 90,
};

export default function Analytics() {
  const [dateRange,    setDateRange]    = useState("30days");
  const [selectedUser, setSelectedUser] = useState("");
  const days = DATE_RANGE_TO_DAYS[dateRange] || 30;

  const { data, loading, error, refresh } = useAnalytics(days, selectedUser || null);
  const [activeTab, setActiveTab] = useState("analytics");

  const uiConfig = data?.ui_config;

  useEffect(() => {
    if (uiConfig?.tabs?.length && !uiConfig.tabs.find((t) => t.value === activeTab)) {
      setActiveTab(uiConfig.tabs[0].value);
    }
  }, [uiConfig, activeTab]);

  if (error) {
    return (
      <div className="an-page">
        <div className="an-error">
          <p className="an-error-title">Unable to load analytics.</p>
          <button className="an-error-retry" onClick={refresh}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="an-page">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        data={data}
        uiConfig={uiConfig}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={refresh}
      />

      <AnimatePresence mode="wait">
        {activeTab === "analytics" ? (
          <FileAnalyticsView
            key="analytics"
            data={data}
            loading={loading}
            uiConfig={uiConfig}
          />
        ) : (
          <SecurityView
            key="security"
            data={data}
            loading={loading}
            uiConfig={uiConfig}
            selectedUser={selectedUser}
            onUserFilterChange={setSelectedUser}
          />
        )}
      </AnimatePresence>
      <ScrollToTop />
    </div>
  );
}