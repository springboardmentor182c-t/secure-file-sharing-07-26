// client/src/features/analytics/components/Header/Header.js

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Check, RefreshCw } from "lucide-react";
import { exportAnalyticsPDF } from "../../services/analyticsService";
import DateRangeDropdown from "./DateRangeDropdown";

export default function Header({
  activeTab,
  setActiveTab,
  data,
  uiConfig,
  dateRange,
  setDateRange,
  onRefresh,
}) {
  const [exporting, setExporting] = useState(false);
  const [exported,  setExported]  = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const tabs        = uiConfig?.tabs        || [];
  const dateRanges  = uiConfig?.date_ranges || [];

 const handleExport = async () => {
  if (exporting || !data) return;

  // Convert dateRange dropdown value → days number
  const daysMap = { "7days": 7, "30days": 30, "90days": 90 };
  const days = daysMap[dateRange] || 30;

  setExporting(true);
  try {
    await exportAnalyticsPDF(activeTab, days);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    setExporting(false);
  }
};

  const handleRefresh = async () => {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="an-header">
      <div className="an-header-left">
        <h1 className="an-header-title">Analytics</h1>
        <p className="an-header-sub">
          Workspace performance and security insights.
        </p>
      </div>

      <div className="an-header-right">
        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="an-tab-switch">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`an-tab-btn ${activeTab === t.value ? "an-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(t.value)}
              >
                {activeTab === t.value && (
                  <motion.div
                    className="an-tab-pill"
                    layoutId="an-tab-pill"
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  />
                )}
                <span className="an-tab-btn-label">{t.label}</span>
              </button>
            ))}
          </div>
        )}

                {/* Date range — premium dropdown */}
        <DateRangeDropdown
          options={dateRanges}
          value={dateRange}
          onChange={setDateRange}
        />

        {/* Refresh button */}
        <motion.button
          className="an-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
          title="Refresh data"
        >
          <motion.span
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ display: "flex" }}
          >
            <RefreshCw size={14} />
          </motion.span>
        </motion.button>

        {/* Export */}
        <motion.button
          className={`an-export-btn ${exported ? "an-export-btn--success" : ""}`}
          onClick={handleExport}
          disabled={exporting || !data}
          whileHover={!exporting ? { y: -2, boxShadow: "0 12px 24px rgba(37,99,235,0.30)" } : {}}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        >
          <AnimatePresence mode="wait">
            {exporting ? (
              <motion.span
                key="exporting"
                className="an-export-inner"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <svg className="an-spinner" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Exporting…
              </motion.span>
            ) : exported ? (
              <motion.span
                key="done"
                className="an-export-inner"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Check size={14} />
                Exported!
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                className="an-export-inner"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <Download size={14} />
                Export Report
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}