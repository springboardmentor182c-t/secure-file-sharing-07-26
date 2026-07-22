// client/src/features/analytics/components/views/FileAnalyticsView.js
/**
 * File Analytics tab content.
 * Composes: KPI grid + Storage chart + Top files + Volume chart + Donut.
 * All UI text/config passed down from ui_config.
 */

import React from "react";
import { motion } from "framer-motion";
import KPIGrid          from "../kpi/KPIGrid";
import StorageAreaChart from "../charts/StorageAreaChart";
import VolumeBarChart   from "../charts/VolumeBarChart";
import DepartmentDonut  from "../charts/DepartmentDonut";
import TopSharedFiles   from "../panels/TopSharedFiles";

// Expected final KPI count for File Analytics tab (5 cards)
const FILE_KPI_SKELETON_COUNT = 5;

export default function FileAnalyticsView({
  data,
  loading,
  uiConfig,
}) {
  const kpiConfig = uiConfig?.file_kpis || [];
  const chartsCfg = uiConfig?.charts    || {};
  const panelsCfg = uiConfig?.panels    || {};

  return (
    <motion.div
      className="an-view"
      key="file-analytics"
      initial={{ opacity: 0, y:  8 }}
      animate={{ opacity: 1, y:  0 }}
      exit={{    opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* KPI row */}
      <KPIGrid
        config={kpiConfig}
        data={data?.kpi}
        subtitles={data?.subtitles}
        skeletonCount={FILE_KPI_SKELETON_COUNT}
        loading={loading}
      />

      {/* Row 1: Storage trend + Top files */}
      <div className="an-row an-row--3-2">
        <StorageAreaChart
          trend={data?.storage?.trend}
          loading={loading}
          config={chartsCfg.storage}
        />
        <TopSharedFiles
          topFiles={data?.sharing?.top_files}
          loading={loading}
          config={panelsCfg.top_files}
        />
      </div>

      {/* Row 2: Volume chart + Donut */}
      <div className="an-row an-row--3-2">
        <VolumeBarChart
          volumeWeekly={data?.uploads?.volume_weekly}
          loading={loading}
          config={chartsCfg.volume}
        />
        <DepartmentDonut
          byDepartment={data?.sharing?.by_department}
          loading={loading}
          config={chartsCfg.department}
        />
      </div>
    </motion.div>
  );
}